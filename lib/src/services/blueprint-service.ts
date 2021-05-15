import { basename, join } from "path";

import { Directory, DirectoryBlueprint, ProjectBlueprint } from "../types";
import { createBlueprint, createFsItem } from "../utils";
import { FileWriter, FileReader } from "../components";

export class BlueprintService {
  constructor(
    private readonly fileReader: FileReader,
    private readonly fileWriter: FileWriter,
    private readonly blueprintsRootDirectory: string
  ) {}

  async saveBlueprint(blueprintName: string, blueprint: ProjectBlueprint): Promise<void> {
    const directoryBlueprint = createFsItem(
      new DirectoryBlueprint(blueprintName, blueprint.items),
      {
        basePath: this.blueprintsRootDirectory,
      }
    );
    await this.fileWriter.createDirectory(directoryBlueprint);
  }

  async loadBlueprint(blueprintName: string): Promise<ProjectBlueprint> {
    const files = await this.fileReader.readAll(join(this.blueprintsRootDirectory, blueprintName), {
      recursive: true,
    });
    return { items: files.map(createBlueprint) };
  }

  async listBlueprints(): Promise<string[]> {
    return this.fileReader
      .listAll(this.blueprintsRootDirectory, {
        recursive: false,
      })
      .then((files) =>
        files.filter((file) => file instanceof Directory).map((file) => basename(file.path))
      );
  }

  async blueprintExists(blueprintName: string): Promise<boolean> {
    return this.fileReader.exists(join(this.blueprintsRootDirectory, blueprintName));
  }

  async deleteBlueprint(blueprintName: string): Promise<void> {
    const blueprintExists = await this.blueprintExists(blueprintName);
    if (blueprintExists) {
      return this.fileWriter.delete(join(this.blueprintsRootDirectory, blueprintName));
    } else {
      return Promise.reject(new Error(`The blueprint '${blueprintName}' does not exist`));
    }
  }
}
