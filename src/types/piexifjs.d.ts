declare module "piexifjs" {
  export function remove(jpegData: string): string;
  export function dump(exifObj: any): string;
  export function insert(exifData: string, jpegData: string): string;
  export function load(jpegData: string): any;
}
