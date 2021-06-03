


import * as fs from "fs";
import { join, dirname } from "path";
import { exit } from "process";

const args = process.argv.slice(2);
if(args.length < 3) {
    console.error("usage: script origindir targetWebDir targetNativeDir");
    exit(1);
}
const originPath = args[0];
const targetWebDir = args[1];
const targetNativeDir = args[2];

function isTns(filename: string) {
    const splitFile = filename.split('.');
    if(splitFile.length >= 3) { // can be tns!
        return splitFile[splitFile.length - 2] === 'tns';
    }
    return false;
}

function doWork(rootDir: string, childPath: string) {
    const currentDirPath = join(rootDir, childPath);
    const files = fs.readdirSync(currentDirPath);
    files.forEach((filename) => {
        const filePath = join(currentDirPath, filename);
        const stat = fs.statSync(filePath);
        if(stat.isDirectory()) {
            doWork(rootDir, join(childPath, filename));
            return;
        }
        const splitFile = filename.split('.');
        let targetNativeFilename = filename;
        let targetWebFilename = filename;
        if(isTns(filename)) {
            targetNativeFilename = [...splitFile.slice(0, splitFile.length - 2), splitFile[splitFile.length - 1]].join('.');
            targetWebFilename = "";
        } else {
            if(splitFile.length >= 2) {
                const possibleTnsFilename = [...splitFile.slice(0, splitFile.length - 1), 'tns', splitFile[splitFile.length - 1]].join('.')
                if(fs.existsSync(join(currentDirPath, possibleTnsFilename))) {
                    targetNativeFilename = ""; // gonna be processed later
                }
            }
        }
        if(targetNativeFilename) {
            const nativeFilePath = join(targetNativeDir,childPath, targetNativeFilename);
            console.log("cp", filePath, nativeFilePath);
            fs.mkdirSync(dirname(nativeFilePath), { recursive: true });
            fs.copyFileSync(filePath, nativeFilePath);
        }
        if(targetWebFilename) {
            const webFilePath = join(targetWebDir,childPath, targetWebFilename);
            console.log("cp", filePath, webFilePath);
            fs.mkdirSync(dirname(webFilePath), { recursive: true });
            fs.copyFileSync(filePath, webFilePath);
        }
        // console.log("path:", filePath,"web:", targetWebFilename,"native:", targetNativeFilename);
    });
}

doWork(originPath, "");
