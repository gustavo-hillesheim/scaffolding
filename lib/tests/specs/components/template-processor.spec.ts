import { TemplateProcessor } from "../../../src";

describe("TemplateProcessor", () => {
  let templateProcessor: TemplateProcessor;

  beforeEach(() => {
    templateProcessor = new TemplateProcessor();
  });

  it("should interpolate a String variable", () => {
    const result = templateProcessor.process("I'm a $variable", {
      variable: "string",
    });
    expect(result).toEqual("I'm a string");
  });

  it("should interpolate a Number variable", () => {
    const result = templateProcessor.process("I'm a $number", {
      number: 10,
    });
    expect(result).toEqual("I'm a 10");
  });

  it("should interpolate a Boolean variable", () => {
    const result = templateProcessor.process("I'm $boolean", {
      boolean: false,
    });
    expect(result).toEqual("I'm false");
  });

  it("should interpolate in multiline template", () => {
    const result = templateProcessor.process("I'm \na \n$templateVariable", {
      templateVariable: "Test",
    });
    expect(result).toEqual("I'm \na \nTest");
  });

  it("should not interpolate empty string", () => {
    const result = templateProcessor.process("", {});
    expect(result).toEqual("");
  });

  it("should throw error when interpolating a non-existing variable", () => {
    expect(() => templateProcessor.process("$var", {})).toThrowError(
      "Variable 'var' was not defined"
    );
  });
});