class ApiError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
  }

  // не корректный запрос
  static badRequest(message) {
    return new ApiError(400, message);
  }

  // не авторизован
  static unauthorized(message) {
    return new ApiError(401, message);
  }
  // в доступе отказано
  static forbidden(message) {
    return new ApiError(403, message);
  }
  // не существует
  static notFound(message) {
    return new ApiError(404, message);
  }
  // ошибка сервера
  static internal(message) {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
