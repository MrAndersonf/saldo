
module.exports = {
    formater(money) {
        let value = Number(money)
        return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' })
    },
    sanitizeCurrency(raw){
        return raw.replace(/[^0-9,]*/g, '').replace(',', '') 
    }
}


