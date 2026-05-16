import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  // FINAL ROUTE for single product image upload
  productImage: f({
    image: { maxFileSize: "128MB", maxFileCount: 1 },
    blob: { maxFileSize: "128MB", maxFileCount: 1 }
  })
  .middleware(async () => {
    return { userId: "admin" };
  })
  .onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),

  // FINAL ROUTE for bulk product images upload
  bulkProductImage: f({
    image: { maxFileSize: "128MB", maxFileCount: 100 },
    blob: { maxFileSize: "128MB", maxFileCount: 100 }
  })
  .middleware(async () => {
    return { userId: "admin" };
  })
  .onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
