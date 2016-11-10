using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using Newtonsoft.Json;
namespace Hangman
{
    public class HttpWrapper
    {
        private HttpClient httpClient;
        private string baseUri;

        public HttpWrapper(string baseUrl, string code)
        {
            httpClient = new HttpClient();
            this.baseUri = string.Format("{0}?code={1}", baseUrl, code);
        }

        public async Task<Response> GetResponse(string token, string guess)
        {
            string requestUri;
            if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(guess))
            {
                requestUri = this.baseUri;
            }
            else
            {
                requestUri = string.Format("{0}&token={1}&guess={2}", baseUri, token, guess);
            }
            HttpResponseMessage response = await httpClient.GetAsync(requestUri);
            string responseString = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Response>(responseString);
        }
    }
}
