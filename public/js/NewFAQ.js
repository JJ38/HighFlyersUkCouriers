const answers = document.querySelectorAll('.answerhidden');
const questions = document.querySelectorAll('.questionwrapper');

console.log(answers[0].classList[0]);


for(let i = 0; i < questions.length; i++){
  questions[i].addEventListener('click', e => {

      if(answers[i].classList[0] == "answerhidden"){
          answers[i].classList = "answershowing";
      }else{
        answers[i].classList = "answerhidden";
      }


  });
}
