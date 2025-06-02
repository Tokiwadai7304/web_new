const {hash} = require('bcryptjs');
const {compare} = require('bcryptjs');
exports.hashPassword = (value,saltValue) =>{
    const result = hash(value, saltValue);
    return result;
}

exports.doHashvalidate = (value, hashedValue) => {
    const result = compare(value, hashedValue);
    return result;
}