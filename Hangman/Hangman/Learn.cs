using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hangman
{
    //assuming max length of word to be 50;
    /// <summary>
    /// This class maintains the list of all words accounted till now based non their lengths. Also calcualted how much probable each letter is given some prior conditions and Evidences 
    /// </summary>
    public class Learn
    {
        public static List<List<string>> dump = new List<List<string>>();
        static Learn()
        {
            for (int i = 0; i < 50; i++)
            {
                dump.Add(new List<string>());
            }
        }

        /// <summary>
        /// Method to be exposed to outer classes. Learning
        /// </summary>
        /// <param name="currentString"></param>
        /// <param name="guessed">bit array for letters which are guessed</param>
        /// <param name="final">bool to indicate that current round done, add words to dump.</param>
        /// <returns>A list of most probable words</returns>
        public List<string> LearnNow(string currentString, List<bool> guessed, bool final = false)
        {
            List<string> brokenString = currentString.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).ToList();
            List<string> best = new List<string>();
            for (int i = 0; i < brokenString.Count; i++)
            {
                if (brokenString[i].Contains('_'))
                {
                    List<List<int>> info = new List<List<int>>();

                    for (int j = 0; j < brokenString[i].Length; j++)
                    {
                        info.Add(new List<int>());
                        for (int g = 0; g < guessed.Count; g++)
                        {
                            if (guessed[g] && brokenString[i][j] == '_')
                            {
                                info[j].Add(-g - 1);
                            }
                            else if (guessed[g] && brokenString[i][j] == 'A' + g)
                            {
                                info[j].Add(g + 1);
                            }
                        }
                    }
                    best.Add(this.GuessNextChar(brokenString[i], dump[brokenString[i].Length], info));
                }
                else if (final)
                {
                    dump[brokenString[i].Length].Add(brokenString[i]);
                }
            }
            return Process(best, guessed);
        }

        private List<string> Process(List<string> best, List<bool> guessed)
        {
            bool[] done = new bool[26];
            List<string> ret = new List<string>();
            for (int i=0;i<best.Count; i++)
            {
                if (!done[best[i][0] - 'A'])
                {
                    done[best[i][0] - 'A'] = true;
                    if (guessed[best[i][0] - 'A'] == false)
                    {
                        ret.Add(best[i]);
                    }
                }
            }
            return ret;
        }

        /// <summary>
        /// Probability that a given word fits with the Evidence
        /// </summary>
        /// <param name="state">Evidnce Matrix</param>
        /// <param name="word"></param>
        /// <returns>1 or 0</returns>
        private int EvidenceGivenWord(List<List<int>> state, string word)
        {
            int p = 1;
            for (int i = 0; i < state.Count; i++)
            {
                if (state[i].Count == 0)
                {
                    p = p * 1;
                }
                else
                {
                    for (int j = 0; j < state[i].Count; j++)
                    {
                        if (state[i][j] > 0 && word[i] == 'A' + state[i][j] - 1)
                            p = p * 1;
                        else if (state[i][j] < 0 && word[i] != 'A' - state[i][j] - 1)
                            p = p * 1;
                        else
                        {
                            p = p * 0;
                            return p;
                        }
                    }
                }
            }
            return p;
        }

        /// <summary>
        /// guess next word based on store and state.
        /// </summary>
        /// <param name="input"></param>
        /// <param name="store">dump</param>
        /// <param name="state">Evidence</param>
        /// <returns>a string char which has maximum probability</returns>
        private string GuessNextChar(string input, List<string> store, List<List<int>> state)
        {
            int den = 0;
            List<double> tempArray = new List<double>();
            for (int i = 0; i < store.Count; i++)
            {
                den += (EvidenceGivenWord(state, store[i]));
            }

            for (int l = 0; l < 26; l++)
            {
                double pdp = 0;
                for (int w = 0; w < store.Count; w++)
                {
                    double prob = 1;
                    int flag = 0;
                    for (int i = 0; i < state.Count; i++)
                    {
                        if (state[i].Count == 0 || (state[i].Count > 0 && state[i][state[i].Count - 1] < 0))
                        {
                            if (store[w][i] == 'A' + l)
                            {
                                prob = prob * 1;
                                flag = 1;
                            }
                        }
                    }
                    prob = prob * flag;
                    double num = 0.0;
                    if (prob == 1)
                    {
                        prob = prob * EvidenceGivenWord(state, store[w]);
                        num = prob / store.Count;
                    }
                    pdp = pdp + num;
                }
                tempArray.Add(pdp);
            }

            double maxE = 0.0;
            int resultIndex = 0;
            for (int i = 0; i < 26; i++)
            {
                if (tempArray[i] > maxE)
                {
                    resultIndex = i;
                    maxE = tempArray[i];
                }
            }
            char result = (char)('A' + resultIndex);
            return result.ToString();

        }
    }
}
