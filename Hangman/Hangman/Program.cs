using System;
using System.Collections.Generic;
using System.Configuration;

namespace Hangman
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Welcome to HuluHangman!");
            string baseURL = ConfigurationManager.AppSettings["baseURL"];
            string code = ConfigurationManager.AppSettings["code"];

            HttpWrapper httpWrap = new HttpWrapper(baseURL, code);
            while (true)
            {
                List<bool> guessed = new List<bool>(26);
                for (int i = 0; i < 26; i++)
                {
                    guessed.Add(false);
                }
                Learn learner = new Learn();
                Console.WriteLine("---Press any key to Start a New Game---");
                Console.ReadKey();
                Response init = httpWrap.GetResponse(null, null).Result;
                Console.WriteLine("Word State : " + init.state);
                Console.WriteLine("Status : " + init.status);
                Console.WriteLine("Remianing Guess : " + init.remaining_guesses);

                do
                {
                    List<string> bestGuess = learner.LearnNow(init.state, guessed);
                    if (bestGuess.Count > 0)
                    {
                        Console.Write("I think ");
                        for (int i = 0; i < bestGuess.Count; i++)
                        {
                            Console.Write(bestGuess[i] + " ");
                        }
                        Console.WriteLine("would be nice!");
                    }
                    Console.WriteLine("What's your best guess?? ");
                    string guess = Console.ReadLine();
                    guess = guess.ToUpper();
                    if (guessed[guess[0]-'A'] == true)
                    {
                        Console.WriteLine("You tried that already!");
                        continue;
                    }
                    guessed[guess[0] - 'A'] = true; 
                    init = httpWrap.GetResponse(init.token, guess).Result;
                    Console.WriteLine("Word State : " +init.state);
                    Console.WriteLine("Guesses Remianing : " + init.remaining_guesses);
                } while (init.remaining_guesses > 0 && init.status =="ALIVE");

                if (init.status  == "FREE")
                {
                    Console.WriteLine("Yo Bro! You guessed it right!\n");
                }
                else
                {
                    Console.WriteLine("Better Luck next time!\n");
                }
                learner.LearnNow(init.state, guessed, true);
            }
        }
    }
}
