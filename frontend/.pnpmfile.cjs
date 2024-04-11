function readPackage(pkg, context) {
    if (!pkg.dependencies) {
        // В редких случаях pnpm ломается на пакетах, в которых не указано поле dependencies в package.json
        pkg.dependencies = {};
    }

    return pkg;
}

module.exports = {
    hooks: {
        readPackage,
    },
};
