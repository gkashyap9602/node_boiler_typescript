import fileSystem from 'fs'
const fs = require('fs.promises');

export const readHTMLFile = async function (path: string) {
    return new Promise(async (resolve, reject) => {
        try {
            const read = await fileSystem.promises.readFile(path, { encoding: 'utf-8' })
            resolve(read)
        }
        catch (err) {
            reject(err)
        }

    })
};


export const deleteFile = async function (filePath: string) {
    await fs.unlink(filePath);
};

export const readFile = async function (filePath: string) {
    try {
        // return fs.readFileSync(filePath)
        fs.readFile(filePath, 'utf8', function (err: any, data: any) {

            // Display the file content
            console.log(data, "fs read side ");
            return data
        });

    } catch (error) {
        console.log(error, "error file path file system side ")
    }

}


export const readDirectory = async function (directoryPath: string) {
    return await fs.readdir(directoryPath);
}


export const makeDirectory = async function (directoryPath: string) {
    return await fs.mkdir(directoryPath, { recursive: true });
}


export const deleteDirectory = async function (directoryPath: string) {
    let files = await fs.readdir(directoryPath);

    for (const file of files) {
        await deleteFile(`${directoryPath}/${file}`);
    }
    await fs.rmdir(directoryPath);
};


export const deleteFolder = async function (directoryPath: string) {
    await fs.rmdir(directoryPath);
};
