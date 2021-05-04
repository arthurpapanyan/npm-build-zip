'use strict';

const archiver = require('archiver-promise');
const packlist = require('npm-packlist');
const path = require('path');
const sanitize = require('sanitize-filename');
const fs = require('fs')

const forceReplace = process.env.FORCE_REPLACE === "true" || false
const archive_prefix = process.env.ARCHIVE_PREFIX || ""

function handle_existing_packlist(packlist_path){
    try {
        if (fs.existsSync(packlist_path)) {
                fs.unlink(packlist_path, (data, err)=>{
                    if(err) console.error(err)
            })
            console.log("Force Replace is on. \nDeleting : " + packlist_path)
        }else{
            console.log("File doesn't exist: Creating " + packlist_path)

        }
      } catch(err) {
          console.log(err)
    }
}

function prepare_package_name(name){
    name = archive_prefix ? archive_prefix + name : name
    name = forceReplace ? name : `${name}_${Date.now()}`
    return sanitize(name)

}

function zipFiles(files, filename, source, destination, info, verbose) {
    const target = path.join(destination, filename);
    handle_existing_packlist(target)
    if (info) console.log(`Archive: ${target}`);
    let archive = archiver(target);
    files.forEach(file => {
        const filePath = path.join(source, file);
        if (verbose) console.log(file);
        archive.file(filePath, { name: file });
    });

    return archive.finalize();
}

function pack({ source, destination, info, verbose, name, includes }) {
    source = source || './build';
    name = prepare_package_name(name, source);
    return packlist({
        path: source,
        bundled: includes.split(',')
    }).then(files => {
        return zipFiles(
            files,
            `${name}.zip`,
            source,
            destination,
            info,
            verbose
        );
    });
}

module.exports = {
    pack
};
