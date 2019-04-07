
const isEmpty = (field) =>{
    if(field.trim() === '') return true;
    else return false;
}

const isEmail = (field) =>{
    const emailRegEx = 
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(field.match(emailRegEx)) return true;
    else return false;
}

exports.validateSignUpData = (data) => {
    //Validate data
    let errors = {};

    //Email
    if(isEmpty(data.email)){
        errors.email = "Email field can not be empty";
    }else if(!isEmail(data.email)){
        errors.email = "Please enter a valid email";
    }

    //Password
    if(isEmpty(data.password)) errors.password = "Password field can not be empty";
    if(data.password !== data.confirmPassword) errors.confirmPassword = "Password fields must match";
    
    //Handle
    if(isEmpty(data.handle)) errors.handle = "Handle field can not be empty";
    // if(Object.keys(errors).length > 0) return res.status(400).json(errors);
    
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = (data) => {
    
    let errors = {};
    if(isEmpty(data.email)) errors.email = "Email field is required.";
    if(isEmpty(data.password)) errors.password = "Password field is required.";
    //if(Object.keys(errors).length > 0 ) return res.status(400).json(errors);

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.reduceUserDetails = (data)=> {
    let userDetails = {};

    if(!isEmpty(data.bio.trim())) userDetails.bio = data.bio;

    if(!isEmpty(data.website.trim())){
        if(data.website.substring(0, 4) !== 'http'){
            userDetails.website = `http://${data.website.trim()}`
        }else{
            userDetails.website = data.website.trim()
        }
    }
    if(!isEmpty(data.location.trim())) userDetails.location = data.location;
    return userDetails;
}