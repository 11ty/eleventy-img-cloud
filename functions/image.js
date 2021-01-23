const EleventyImage = require("@11ty/eleventy-img");

function isFullUrl(url) {
  try {
    new URL(url);
    return true;
  } catch(e) {
    // invalid url OR local path
    return false;
  }
}

// Based on https://github.com/DavidWells/netlify-functions-workshop/blob/master/lessons-code-complete/use-cases/13-returning-dynamic-images/functions/return-image.js
exports.handler = async (event, context) => {
  let { url, format, width } = event.queryStringParameters;
  let metadata;
  let source;

  if(!format) {
    format = "jpeg";
  }
  if(!width) {
    width = false;
  }

  try {
    if(!isFullUrl(url)) {
      throw new Error(`Invalid \`url\`: ${url}`);
    }

    metadata = await EleventyImage(url, {
      formats: [format],
      widths: [width],
      dryRun: true,
      cacheOptions: {
        dryRun: true,
      }
    });

    if(!metadata[format]) {
      throw new Error(`Invalid \`format\`: ${format}`);
    }

    source = metadata[format][0];
  } catch (error) {
    console.log("Error", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    }
  }

  return {
    statusCode: 200,
    headers: {
      'content-type': source.sourceType
    },
    body: source.buffer.toString('base64'),
    isBase64Encoded: true
  }
}