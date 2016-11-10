Language : C#
IDE : Visual Studio 2015.
.NET Framework 4.5.
Configurable Parameters : Change App.config. (Base url and code of url)
What to Run : Run the .exe (application file) from command line. 

Code Files :
	Program.cs
	Learn.cs
	HttpWrapper.cs
	Response.cs
Supporting libraries - All .dlls are included in the solution folder.

Packages Used :
	NewtonsoftJson - for json parsing
	Microsoft.Net.Http - for http layer
	Microsoft.Bcl - for VS build

Using Prior Data to guess the most likely character in a word. Splitting each word and treating them individually.

If devenv is installed, build from command line : 
devenv "..\Hangman.sln" /build Debug /project "..\Hangman\Hangman.csproj" /projectconfig Debug 