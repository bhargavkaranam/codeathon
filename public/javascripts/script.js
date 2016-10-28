$(document).ready(function(){
	
	
	setInterval(checkForNotifications,600000);
	var editor = ace.edit("editor");
	getAllQuestions();
	setInterval(getAllQuestions,600000)

	editor.setTheme("ace/theme/tomorrow_night");
	$(document).on("click",".toggleResources",function(){
		$(".hints-resources").toggleClass('expand');
		$(".editor").toggleClass('shrink');
		$(".hints-resources i").toggleClass('moveleft');
		if($(this).attr('id') == "resources")
		{
			
			$('.desc').toggle();
			var desc = JSON.search(questions, '//*[qno=' + currentQuestionNo + ']');

			$(".desc").html(desc[0].testcases);
		}
		else if($(this).attr('id') == "hints")
		{
			$('.desc').toggle();
			var desc = JSON.search(questions, '//*[qno=' + currentQuestionNo + ']');
			
			$(".desc").html("<u><h2>Hints</h2></u>" + desc[0].hints);	
		}

	});


	$(document).on("click",".user",function(){
		$(".menu-drawer").toggle();
	});	

	var questions,currentQuestionNo;

	$.ajax({
		url : '/userdetails',
		dataType : 'json',
		success : function(data)
		{
			$(".username").html(data.username);
			$(".teamname").html(data.teamname);
		}
	});
	function getAllQuestions()
	{
		$.ajax({
			url : '/getquestions',
			dataType : 'json',
			success : function(data)
			{

				questions = data;			
				currentQuestionNo = data[0].qno;
				$(".question-text div").html(data[0].question.replace(/\n/g,"<br/>"));
				console.log(questions);			

			}
		});
	}
	$(document).on("click","#prev",function(){

		if(checkIfFirst(currentQuestionNo))
		{
			toastr.info("No more questions to display!");
			return false;
		}

		
		currentQuestionNo--;
		var question = JSON.search(questions, '//*[qno=' + currentQuestionNo + ']');
		$(".question-text div").html(question[0].question.replace(/\n/g,"<br/>")).promise().done(function(){
			
		});

	});

	$(document).on("click","#next",function(){

		if(checkIfLast(currentQuestionNo))
		{
			toastr.info("No more questions to display!");
			return false;		
		}
		currentQuestionNo++;
		$("#prev").prop('disabled',false);
		var question = JSON.search(questions, '//*[qno=' + currentQuestionNo + ']');
		$(".question-text div").html(question[0].question.replace(/\n/g,"<br/>")).promise().done(function(){
			
		});

	});

	$(document).on("click","#submitcode",function(){

		$.ajax({
			url : '/submitcode',
			type : 'post',
			data : 'code=' + JSON.stringify(editor.getValue()) + '&qno=' + currentQuestionNo,
			dataType : 'json',
			success : function(data) {
				if(data.status == "true")
					toastr.info("The code was successfully submitted");
				else if(data.status == "false" && data.code == "103")
					window.location.href = "/login";
			}
		});

	});

	$(".file-input").change(function(){
		uploadCode();
	});

	function uploadCode()
	{
		var files = document.getElementById("file-select").files;
		
		var file = files[0];			
		var formdata = new FormData();
		formdata.append('code[]',file,file.name);		
		formdata.append('qno',currentQuestionNo);
		$.ajax({
			url: '/uploadcode',
			type: 'POST',
			data: formdata,
			processData: false,
			contentType: false,
			beforeSend : function() {
				$(".file-upload").prop('disabled',true);
				$(".file-upload").text("Uploading...")
			},
			success: function(data){
				$(".file-upload").text("Upload Code");
				if(data.status == "true")	
				{
					$(".file-upload").prop('disabled',false);
					toastr.info('Upload successful');
				}
				else
				{
					$(".file-upload").prop('disabled',false);
					toastr.info('Some error occurred');
				}
				
			},
		});
	}



	function checkIfFirst(qno)
	{
		if(qno == 1)
			return true;
		else if(qno > 1)
			return false;
	}
	function checkIfLast(qno)
	{
		if(qno == questions.length)
			return true;
		else if(qno < questions.length)
			return false;
	}
	function checkForNotifications()
	{
		$.ajax({
			url : '/notifications/',
			type : 'post',
			dataType : 'json',
			data : 'time=' + Date.now(),
			success : function(data) {

				if(data.notification.length)
				{
					
					for(var i = 0;i < data.notification.length;i++)
						toastr.info(data.notification[i].text);
				}
			}
		})
	}
});