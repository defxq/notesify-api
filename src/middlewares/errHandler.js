const errHandler = (err, req, res, next) => {
    console.log(err.stack);
    const status = res.statusCode ? res.statusCode : 500;
    res.status(status).json({ message: err.message, isError: true });

};

export default errHandler;

 