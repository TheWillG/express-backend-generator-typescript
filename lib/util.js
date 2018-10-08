var fs = require('fs');
var path = require('path');

const copyFileSync = ( source, target ) => {
    var targetFile = target;
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }
    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

const copyFolderRecursiveSync = ( source, target ) => {
    var files = [];
    var targetFolder = path.join( target, path.basename( source ) );
    if ( !fs.existsSync( targetFolder ) ) {
        fs.mkdirSync( targetFolder );
    }
    if ( fs.lstatSync( source ).isDirectory() ) {
        files = fs.readdirSync( source );
        files.forEach( function ( file ) {
            var curSource = path.join( source, file );
            if ( fs.lstatSync( curSource ).isDirectory() ) {
                copyFolderRecursiveSync( curSource, targetFolder );
            } else {
                copyFileSync( curSource, targetFolder );
            }
        } );
    }
}

const createNonExistantDirSync = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

const capFirstLetter = (string) => {
  const str = string.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports.capFirstLetter = capFirstLetter;
module.exports.copyFileSync = copyFileSync;
module.exports.copyFolderRecursiveSync = copyFolderRecursiveSync;
module.exports.createNonExistantDirSync = createNonExistantDirSync;
