export const successResponse = (res, message, status = 200, data = null) => {
    return res.status(status).json({ success: true, message, data });
  };
  
  export const errorResponse = (res, message, status = 400) => {
    return res.status(status).json({ success: false, message });
  };
  