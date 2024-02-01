import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {

  pdfUploader: f({ image: { maxFileSize: '4MB' } })
    .middleware(async ({ req }) => {
      return {};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
