declare module "virtual:optimized-images" {
  const images: Record<"hero" | "cover", { src: string; width: number }[]>;
  export default images;
}
