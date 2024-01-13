class ApiError extends Error{
    constructor(
        statusCode,
        message="Something Went Wrong",
        errors=[],
        stack=""
    ){
        super(message),
        this.statusCode=statusCode,
        this.data=NULL;
        this.message=message,
        this.success=false;
        this.errors=errors;
    }
}
