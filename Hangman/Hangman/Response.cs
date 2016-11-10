using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hangman
{
    public class Response
    {
        public string status{ get; set; }
        public string token { get; set; }
        public string state { get; set; }
        public int remaining_guesses{ get; set; }
    }
}
