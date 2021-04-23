const Modal = {
    toogle() {
        const existActive = document.querySelector('.modal-overlay').classList.contains('active')
        if(!existActive) {
            document.querySelector('.modal-overlay').classList.add('active')
        }else{
            document.querySelector('.modal-overlay').classList.remove('active')
        }
    }
} 

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    //tabela
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    //balanço
    incomes(){ //somar as entradas
        let income = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount; 
            }
        })
        return income;
    },

    expenses(){ //somar as saídas 
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) { 
                expense += transaction.amount; 
            }
        })
        return expense;
    },

    total() { // entradas - saídas
        return Transaction.incomes() + Transaction.expenses() ;
    }
}

//Substituir os dados do HTML com os dados do JS
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index) 
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index){ //HTML interno de uma transação
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img src="./assets/minus.svg" alt="Remover Transação" onclick = "Transaction.remove(${index})">
        </td>
        `
        return html
    }, 

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById("totalDisplay")
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = value * 100
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "") //expressão reular reJAX
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + " " + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    //Pega os dados do formulário
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    //verificar se o formulário está vazio - se todas as informações foram preenchidas
    validateFields() {
        const {description, amount, date} = Form.getValues()

        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
               throw new Error("Por favor, preencha todos os campos")
        }
    },

    //formata os dados do form para salvar
    formatValues() {
        let {description, amount, date} = Form.getValues()
        
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    //Limpar
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    //Salvar 
    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields() //Verifica se os campos foram preenchidos
            const transaction = Form.formatValues() //formata os valores do form
            Transaction.add(transaction) //salva a transação
            Form.clearFields() //apaga os dados do formulário
            Modal.toogle() //Fecha o modal e atualiza o app
        }catch(error) {
            alert(error.message)
        }
    }
}  

const App = {
    init() { //inicia a aplicação
        Transaction.all.forEach(DOM.addTransaction)//popula a tabela
        DOM.updateBalance() //popula o balanço

        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init() //reiniciou o app
    }
}

App.init()