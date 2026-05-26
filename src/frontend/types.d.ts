declare module 'just-validate' {
  export default class JustValidate {
    constructor(form: string | HTMLElement, options?: any);
    addField(field: string, rules: any[], config?: any): this;
    addRequiredGroup(groupField: string, errorMessage?: string, config?: any): this;
    onSuccess(callback: (event?: Event) => void): this;
    destroy(): void;
  }
}
