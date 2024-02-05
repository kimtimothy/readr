import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { db } from '@/db';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { getPineconeClient } from '@/lib/pinecone';

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: '4MB' } })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();
      if (!user || !user?.id) throw new Error('UNAUTHORIZED');

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://utfs.io/f/${file.key}`,
          uploadStatus: 'PROCESSING',
        },
      });

      try {
        const response = await fetch(`https://utfs.io/f/${file.key}`);
        const blob = await response.blob();
        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();
        const pagesAmt = pageLevelDocs.length;

        // vectorise and index entire document
        const pinecone = getPineconeClient();
        const pineconeIndex = pinecone.Index('readr');
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: createdFile.id,
        });

        await db.file.update({
          where: {
            id: createdFile.id,
          },
          data: {
            uploadStatus: 'SUCCESS',
          },
        })
      } catch (err) {
        await db.file.update({
          where: {
            id: createdFile.id,
          },
          data: {
            uploadStatus: 'FAILED',
          },
        })
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
