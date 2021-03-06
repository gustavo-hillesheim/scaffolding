import { existsSync, promises } from "fs";
import { dirname, normalize } from "path";

import { Directory, File } from "../types";

export class FileWriter {
  async writeFile(file: File): Promise<void> {
    const directoryPath = dirname(file.path);
    if (!existsSync(directoryPath)) {
      await this.createDirectory(new Directory(directoryPath));
    }
    await promises.writeFile(normalize(file.path), file.content || "", {
      encoding: "utf8",
    });
  }

  async createDirectory(directory: Directory): Promise<void> {
    await promises.mkdir(normalize(directory.path), {
      recursive: true,
    });
    for (const file of directory.children) {
      if (file instanceof File) {
        await this.writeFile(file);
      } else {
        const childDirectory = file as Directory;
        await this.createDirectory(childDirectory);
      }
    }
  }

  async delete(path: string): Promise<void> {
    return promises
      .lstat(path)
      .catch(() => null)
      .then(async (item) => {
        if (!item) {
          return;
        }
        if (item.isDirectory()) {
          await promises.rmdir(path, { recursive: true });
        } else {
          await promises.unlink(path);
        }
      });
  }
}
