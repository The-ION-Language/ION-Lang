import { Expression } from './customClasses/Expression.js';
import { customBoolean, customTypes, customVar, isCustomVar, parserType } from './customClasses/classes.js';
import { customClass } from './customClasses/obj.js';


export const compSymbs = ['==', '<', '>', '>=', '<=', '!=', '!'];
export const incSymbs = ['++', '--', '+=', '-=', '*=', '/='];


function checkCondSingle(leftSide: Expression, op: string, rightSide?: Expression): boolean {
    switch (op) {
        case "!": return !leftSide.val;
        
        case "==": return leftSide.val === rightSide?.val;

        case "<": return leftSide.val < rightSide?.val;

        case ">": return leftSide.val > rightSide?.val;

        case ">=": return leftSide.val >= rightSide?.val;

        case "<=": return leftSide.val <= rightSide?.val;

        case "!=": return leftSide.val != rightSide?.val;

        default: throw `UNKNOWN OPERATION "${op}" FOR "${leftSide} ${op} ${rightSide}"!`;
    }
}


export async function handleConditional(line: string, context: customTypes[], parser: parserType): Promise<customBoolean> {
    // get symbol index
    const sInd = Array.from(line).findIndex(s => compSymbs.includes(s));

    const [leftSide, op, rightside] = [line.slice(0, sInd), line[sInd], line.slice(sInd + 1)];

    let v = (await parser(leftSide, context))[0];
    const leftVal = (isCustomVar(v)) ? v.val : (v as Expression);

    v = (await parser(rightside, context))[0];
    const rightVal = (isCustomVar(v)) ? v.val : (v as Expression);

    if (leftVal instanceof customClass || rightVal instanceof customClass) {
        if (!(leftVal instanceof customClass && rightVal instanceof customClass)) return new customBoolean(false);

        for (const v in leftVal) {
            if (!(v in rightVal && rightVal[v as keyof customClass] === leftVal[v as keyof customClass])) return new customBoolean(false);
        }
        return new customBoolean(true);
    }

    // handle (!thing)
    if (!leftVal) throw "NO VALUE FOUND!";
    if (!rightside) return new customBoolean(checkCondSingle(leftVal, op));

    return new customBoolean(checkCondSingle(leftVal, op, rightVal));
}