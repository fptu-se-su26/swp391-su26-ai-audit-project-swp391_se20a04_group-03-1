declare module "*.css";
declare module "*.module.css";

declare module "@/*" {
  const value: any;
  export default value;
}
