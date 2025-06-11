function run(N, M) {
	/*
	* Write your code below; return type and arguments should be according to the problem\'s requirements
	*/
	let sequence = "";

	for(let i = N; i <= M; i++){

		let tempString = "";

		if(i > N){
			tempString += ",";
		}

		if(i % 3 == 0){
			tempString += "Fizz";
		}

		if(i % 5 == 0){
			tempString += "Buzz";
		}

		if(tempString.length < 2){
			tempString += i.toString();
		}

		sequence += tempString;

	}
	
	return sequence;
}

console.log(run(1,5));