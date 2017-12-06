module.exports = {
    'solve': function (fileName) {
        let formula = readFormula(fileName)
        let result = doSolve(formula.clauses, formula.variables)
        return result
    }
};


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
    let regex = /(\-?[0-9]+\s){1,}0/g;
    // o .search() vai retornar a posição de onde começa as clausulas e o .slice vai criar uma string só com elas.
    let stringClauses = text.slice(text.search(regex));
    // o .split() irá retornar um array com as strings separadas pelo parametro da função.
    let clauses = stringClauses.split('\n');
    for (let i = 0; i < clauses.length; i++) {
        // Se a linha da clausula acabar com '0' será "splitado" normalmente.
        if (clauses[i].endsWith('0\r') || clauses[i].endsWith('0')) {
            clauses[i] = clauses[i].split(' ');
        } else {
            // Se a linha não acabar com '0' ela será concatenada com a próxima, e esta será removida(splice) do array, diminuindo seu tamanho.
            clauses[i] = clauses[i].slice(0, -1) + ' ' + clauses[i + 1];
            clauses.splice(i + 1, 1);
            clauses[i] = clauses[i].split(' ');
        }
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
        // O primeiro valor das variáveis serão todos false.
        variableValues.push(false);
    }
    return variableValues;
}

function checkProblemSpecification(text, clauses, variables) {
    // Regex que identifica o padrão da linha p.
    let reg = /p\scnf\s[0-9]{1,}\s[0-9]{1,}/g;
    let pStarts = text.search(reg);
    if (pStarts === -1) {
        //Se o .cnf não tiver a linha p irá ser retornado true, pois não haverá nenhuma condição restringindo as clausulas.
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

// Variável que armazenará a quantidade de combinações booleanas já utilizadas.
var usedAssignments = 1;

function nextAssignment(currentAssignment) {
    let newAssignment = [];
    let half = Math.pow(2, currentAssignment.length) / 2;
    for (let i = 0; i < currentAssignment.length; i++) {
        // Se a quantidade de assigments passar da metade de possibilidades
        // será calculado com o 'not' das possibilidades passadas.
        if (usedAssignments >= half) {
            newAssignment.push(!Boolean(Math.floor(((usedAssignments - currentAssignment.length) / Math.pow(2, i)) % 2)));
        } else {
            // Será calculado diferentes possibilidades dependendo da quantidade de variáveis já utilizadas(UA).
            // O UA será dividido por 2 ^ i, com o i indo de 0 até a quantidade de variáveis(length).
            // Será depois aplicada a função chão para deixar o resultado inteiro.
            // Depois será obtido o % 2, que só poderá variar entre 0 e 1.
            // Para cada UA será gerado uma sequência diferente de 0 e 1, mas todas as possibilidades entre 0 e 2 ^ length.
            newAssignment.push(Boolean(Math.floor((usedAssignments / Math.pow(2, i)) % 2)));
        }
    }
    // Incremento na quantidade utilizada.
    usedAssignments++;
    return newAssignment;
}

function doSolve(clauses, assignment) {
    let isSat = false;
    // A quantidade total de assignments será 2 ^ tamanho do assignment;
    let totalAssignment = Math.pow(2, assignment.length);
    let usedAssignments = 0;
    // Se for um sat ou ter utilizado todas as possibilidades, sairá do while.
    satSolving: while ((!isSat) && (usedAssignments < totalAssignment)) {
        for (let i = 0; i < clauses.length; i++) {
            // Será formada uma string como formato da sentença de cada linha, para pegar o valor dela com o eval().
            // Se alguma delas for falsa já passa para o próximo assignment.
            let orSentence = '(';
            for (let j = 0; j < clauses[i].length; j++) {
                // Se a variável não tiver o 'not' será adicionada normalmente a sentença com os '||'.
                // Será utilizado o valor da clausula como posição no array de booleanos.
                if (clauses[i][j] > 0) {
                    orSentence += assignment[clauses[i][j] - 1];
                } else {
                    orSentence += !assignment[Math.abs(clauses[i][j]) - 1];
                }
                // Só erá concatenado o ' || ' até antes do último booleano. 
                if (j < clauses[i].length - 1) {
                    orSentence += ' || ';
                }
            }
            if (!(eval(orSentence + ')'))) {
                assignment = nextAssignment(assignment);
                usedAssignments++;
                // Voltará para o começo do while já com outro assignment.
                continue satSolving;
            }
        }
        // Caso nenhum dos 'ou' deu false, chegamos a conclusão que isSat é verdadeiro.
        isSat = true;
    }
    let result = {
        'isSat': isSat,
        satisfyingAssignment: null
    };
    if (isSat) {
        result.satisfyingAssignment = assignment
    }
    return result;
}