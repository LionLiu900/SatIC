function readFormula(fileName) {
    let fs = require('fs');
    // No .readFileSync é necessário passar o nome do arquivo e o encoding.
    let text = fs.readFileSync(fileName, 'utf8');
    let clauses = readClauses(text);
    let variables = readVariables(clauses);
    let specOk = checkProblemSpecification(text, clauses, variables);
    let result = { 'clauses': [], 'variables': [] };
    if (specOk) {
        result.clauses = clauses;
        result.variables = variables;
    }
    return result;
}

function readClauses(text) {
    // Regex que diz a respeito ao padrão das clausulas no .cnf
    let regex = /(\-?[1-9]\s){1,}0/g;
    // o .search() vai retornar a posição de onde começa as clausula e o .slice vai criar uma string só com elas.
    let stringClauses = text.slice(text.search(regex));
    // o .split() irá retornar um array com as strings separadas pelo parametro da função.
    let clauses = stringClauses.split('\n');
    for (let i = 0; i < clauses.length; i++) {
        clauses[i] = clauses[i].split(' ');
        // O .pop irá remover o '0' de cada array.
        clauses[i].pop();
        // O Number() serve para transformar as strings em inteiros.
        for (let j = 0; j < clauses[i].length; j++) {
            clauses[i][j] = Number(clauses[i][j]);
        }
    }
    return clauses;
}

function getVariables(clauses) {
    // Função que retorna as variáveis ordenadas num array.
    // Ex: {1, 2, 3, 4}
    let variables = [];
    for (let i = 0; i < clauses.length; i++) {
        for (let j = 0; j < clauses[i].length; j++) {
            if (!variables.includes(Math.abs(clauses[i][j]))) {
                variables.push(Math.abs(clauses[i][j]));
            }
        }
    }
    variables.sort();
    return variables;
}

function readVariables(clauses) {
    let vars = getVariables(clauses);
    let variableValues = [];
    for (let i = 0; i < vars.length; i++) {
        // Será gerado valores booleanos aleatórios com o Math.random(), que retorna números aleatórios entre 0 e 1.
        variableValues.push(Math.random() >= 0.5);
    }
    return variableValues;
}

function checkProblemSpecification(text, clauses, variables) {
    // Regex que identifica o padrão da linha p.
    let reg = /p\scnf\s[0-9]{1,}\s[0-9]{1,}/g;
    let pStarts = text.search(reg);
    if (pStarts === -1) {
        //Se o .cnf não tiver a linha p irá ser retornado true, pois não haverá nenhuma condição para as clausulas.
        return true;
    } else {
        let pEnds = text.indexOf('\n', pStarts);
        let pSentence = text.slice(pStarts, pEnds).slice(6);// Retorna um padrão /\d\s\d/
        // Separa o /\d\s\d/ em duas string só com os valores.
        let splittedP = pSentence.split(' ');
        // Transformando as strings em inteiros.
        let varsQuantity = Number(splittedP[0]);
        let clausesQuantity = Number(splittedP[1]);
        // Comparação com a condição de p e o tamanho das variáves e das clausulas.
        if (varsQuantity === variables.length && clausesQuantity === clauses.length) {
            return true;
        } else {
            return false;
        }
    }
}

// Variável que armazenará os valores booleanos já utilizados
var usedAssignments = [];

function nextAssignment(currentAssignment) {
    // Adicionando o atual assignment à variável.
    usedAssignments.push(currentAssignment);
    let newAssignment = [];
    for (let i = 0; i < currentAssignment.length; i++) {
        newAssignment.push(Math.random() >= 0.5);
    }
    // Se o novo assignment gerado já foi utilizado ou o total de possibilidades ainda não foi gerada, entrará no while.
    while (isArrayInArray(usedAssignments, newAssignment) && usedAssignments.length < Math.pow(2, currentAssignment.length)) {
        for (let i = 0; i < currentAssignment.length; i++) {
            newAssignment[i] = Math.random() >= 0.5;
        }
    }
    return newAssignment
}

// Função que checa se um array se encontra noutro array. 
function isArrayInArray(inArray, array) {
    for (let i = 0; i < inArray.length; i++) {
        //Usando o .toString(), pois [x, y] === [x, y] dá false. Valeu JavaScript!
        if (inArray[i].toString() === array.toString()) {
            return true;
        }
    }
    return false;
}
