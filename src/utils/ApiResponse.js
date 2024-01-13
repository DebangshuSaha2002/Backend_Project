class ApiResponse{
    constructor(
        statusCode,data,message="true",
    ){
        this.statusCode=statusCode,
        this.message=message,
        this.data=data,
        this.success=statusCode<400
    }
}

