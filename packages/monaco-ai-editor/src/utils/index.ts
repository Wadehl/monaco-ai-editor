// AI service request/response processing utility functions

/**
 * Transform AI completion request format
 * @param provider AI provider name
 * @param model Model name
 * @param prompt Original prompt information
 * @returns Formatted request body
 */
export const transformCompletionRequest = (provider: string, model: string, prompt: any): any => {
  const content = `${prompt.context}\n\n${prompt.instruction}\n\n${prompt.fileContent}`
  
  try {
    switch (provider.toLowerCase()) {
      case 'anthropic':
        return JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: content
            }
          ],
          max_tokens: 256,
        })
      
      case 'openai':
        return JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content,
            }
          ],
          max_tokens: 256,
        })
      
      case 'gemini':
        return JSON.stringify({
          model: model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: content
                }
              ]
            }
          ]
        })
      
      default:
        console.warn(`⚠️ Unknown provider: ${provider}, using default request format`);
        return JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content,
            }
          ]
        })
    }
  } catch (error) {
    console.error(`❌ ${provider} request transformation failed:`, error);
    return JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content,
        }
      ]
    })
  }
}

/**
 * Transform AI completion response format
 * @param provider AI provider name
 * @param responseData Original response data
 * @returns Extracted text content
 */
export const transformCompletionResponse = (provider: string, responseData: any): string => {
  try {
    switch (provider.toLowerCase()) {
      case 'anthropic':
        return responseData.content?.[0]?.text || '';
      
      case 'openai':
        return responseData.output?.[0]?.content?.[0]?.text || responseData.choices?.[0]?.message?.content || '';
      
      case 'gemini':
        return responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      default:
        console.warn(`⚠️ Unknown provider: ${provider}, using default response parsing`);
        return responseData.text || responseData.content || '';
    }
  } catch (error) {
    console.error(`❌ ${provider} response transformation failed:`, error);
    return '';
  }
}

/**
 * Get AI provider request headers configuration
 * @param provider AI provider name
 * @param apiKey API key
 * @returns Request headers object
 */
export const getProviderHeaders = (provider: string, apiKey: string): Record<string, string> => {
  const baseHeaders = {
    'Content-Type': 'application/json',
  }

  switch (provider.toLowerCase()) {
    case 'anthropic':
      return {
        ...baseHeaders,
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      }
    
    case 'openai':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${apiKey}`,
      }
    
    case 'gemini':
      return {
        ...baseHeaders,
        'x-goog-api-key': apiKey,
      }
    
    default:
      console.warn(`⚠️ Unknown provider: ${provider}, using default headers`);
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${apiKey}`,
      }
  }
}

/**
 * Build complete AI service URL
 * @param baseUrl Base URL
 * @param modelName Model name
 * @returns Complete request URL
 */
export const buildProviderUrl = (baseUrl: string, modelName: string): string => {
  return baseUrl.replace('{MODEL_NAME}', modelName)
} 