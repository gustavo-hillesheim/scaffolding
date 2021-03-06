import { join, sep } from "path";
import {
  BlueprintService,
  createBlueprintService,
  createScaffoldingService,
  DirectoryBlueprint,
  FileBlueprint,
  ScaffoldingService,
} from "../../src";
import { clearDir, expectDirAt, expectFileAt, expectNothingAt } from "../utils";

describe("Build Blueprint", () => {
  const BLUEPRINTS_DIRECTORY_PATH =
    __dirname + sep + "input" + sep + "build-blueprint" + sep + "blueprints";
  const OUTPUT_DIRECTORY_PATH = __dirname + sep + "output";

  let blueprintService: BlueprintService;
  let scaffoldingService: ScaffoldingService;

  beforeEach(() => {
    blueprintService = createBlueprintService(BLUEPRINTS_DIRECTORY_PATH);
    scaffoldingService = createScaffoldingService();
  });

  afterEach(() => {
    clearOutputDir();
  });

  it("should create a folder structure based off of a blueprint", async () => {
    const blueprint = await blueprintService.loadBlueprint("sample_project");
    await scaffoldingService.build({
      blueprint,
      outputDirectory: OUTPUT_DIRECTORY_PATH,
      variables: {
        projectName: "dart_project",
      },
    });

    expectDirAt(pathToOutput("dart_project"));
    expectDirAt(pathToOutput("dart_project", "lib"));
    expectFileAt(pathToOutput("dart_project", "pubspec.yaml"), "name: dart_project\r\n");
    expectFileAt(
      pathToOutput("dart_project", "lib", "main.dart"),
      "void main(List<String> args) {\r\n  print('Hello dart_project!');\r\n}\r\n"
    );
  });

  it("should throw error when loading a blueprint that does not exist", async () => {
    await expectAsync(blueprintService.loadBlueprint("non_existing_project")).toBeRejected();
  });

  it("should throw error and not create any file/directory when a template variable was not defined", async () => {
    const buildPromise = scaffoldingService.build({
      blueprint: {
        items: [
          new DirectoryBlueprint("src", [
            new FileBlueprint("$componentName.html", "<h1>$componentName Works!</h1>"),
          ]),
        ],
      },
      outputDirectory: OUTPUT_DIRECTORY_PATH,
      variables: {
        projectName: "dart_project",
      },
    });

    await expectAsync(buildPromise).toBeRejected();
    expectNothingAt(pathToOutput("src"));
  });

  function pathToOutput(...pathSegments: string[]): string {
    return join(OUTPUT_DIRECTORY_PATH, ...pathSegments);
  }

  function clearOutputDir(): void {
    clearDir(OUTPUT_DIRECTORY_PATH);
  }
});
