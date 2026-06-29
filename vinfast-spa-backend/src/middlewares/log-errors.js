module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      await next();
      if (ctx.status === 400) {
        console.log('=== [400 BAD REQUEST DETAILS] ===');
        console.log('Path:', ctx.path);
        console.log('Method:', ctx.method);
        console.log('Request Body:', JSON.stringify(ctx.request.body, null, 2));
        console.log('Response Body:', JSON.stringify(ctx.body, null, 2));
        console.log('==================================');
      }
    } catch (err) {
      console.log('=== [THROWN ERROR DETAILS] ===');
      console.log('Path:', ctx.path);
      console.log('Method:', ctx.method);
      console.log('Error Name:', err.name);
      console.log('Error Message:', err.message);
      if (err.details) {
        console.log('Error Details:', JSON.stringify(err.details, null, 2));
      }
      console.log('===============================');
      throw err;
    }
  };
};
