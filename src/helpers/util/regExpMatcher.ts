export default class RegExpMatcher{
    matchAnythingBetween(firstString: string, secondString: string, stringToTest: string): boolean{
        const rs = `^${firstString} (.*) ${secondString}$`;
        const re = new RegExp(rs);
        return re.test(stringToTest);
    }
}