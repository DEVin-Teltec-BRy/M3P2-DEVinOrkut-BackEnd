class cpfValidator {
    constructor(element) {
        this.element = element;
    }
    clear(cpf) {
        return cpf.replace(/\D/g, '');
    }
    build(cpf) {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
    }
    formate(cpf) {
        const cpfClear = this.clear(cpf);
        return this.build(cpfClear);
    }
    isValid(cpf) {
        const matchCpf = cpf.match(/(?:\d{3}[-.\s]?){3}\d{2}/g);
        return matchCpf && matchCpf[0] === cpf;
    }
}

module.exports = cpfValidator;
