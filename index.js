// Javascript code 


//reusable variables
var days= { total_open_issue: null, last24Hours: null, between1DayTo7Day:null, before7Day:null, in7Days:null }
var url_root="https://api.github.com/"

//loader for the frontend
var loader = document.getElementById("loader")

// one day and seven days strings represent the time in ISO string format of 
// "YYYY-MM-DDTHH-MM-SSZ" we are removing mili seconds from string as github 
// does not accept millisecond in time string
// creating them as function so that when ever a request call is invoke, it considers time from that perticular
// moment of request invocation 
var oneDayString = () => { return new Date(Date.now() - (24 * 3600 * 1000)).toISOString().slice(0, 19) + "Z" }
var sevenDayString = () => { return new Date(Date.now() - (7 * 24 * 3600 * 1000)).toISOString().slice(0, 19) + "Z"; }

//function for hiding and showing loader when network calls are running
loaderHide = () => { loader.classList.add("hide") }
loaderShow = () => { loader.classList.remove("hide") }


/**
 * funciton to called too fetch issues
 * params {
 * 			time_period {function} function to be invoke to get value of the period for 
 * 														 we are finding the no of issues
 * 			
 * 			days {variable} 				variable to show on which variable to sava the count 
 * 
 * } 
 * 
 * */
function fetchRepoIssues(time_period = null, key) {

	//forming the url accordingly
	url = url_root+"search/issues?q=+type:issue+state:open+repo:" + repo + (time_period ? ("+created:>=" + time_period()) : "")


	/**  calling the "api.github.com/search/issues" endpoint which will give us 
	 response as 
		{
			total_counts: {number}
			incomplete_results: {boolean}
			items: {array}	list of the issues, with max limit of length 100, default length 30
		}
	 */
	return fetch(url, {
		headers:
		{
			"Access-Control-Allow-Origin": "*"
		}
	})
		.then(function (response) {
			// if response comes with status code 2XX
			if (response.ok) {
				return response.json()
			}

			alert("invalid repository name")
			//if api call fails hide the loader 
			loaderHide()
			throw "error";
		})
		.then((data) => {

			//asinging the count to their respective variable
			days[key] = data.total_count;
		})
}


/**
 * main function is declared async because we want to use
 * await method, which will ensure the next api call is happeing only after completion of previous one 
 */
async function main() {
	loaderShow()
	await fetchRepoIssues(null, "total_open_issue")
	await fetchRepoIssues(oneDayString, "last24Hours");
	await fetchRepoIssues(sevenDayString, "in7Days");
	renderOnPage()
	loaderHide()
}


/**
 * this function will be invoke when all the data has been fetch, this will change the value in the html table
 */

function renderOnPage() {
	document.getElementById("toi").innerText = days.total_open_issue;
	document.getElementById("l24h").innerText = days.last24Hours;
	document.getElementById("24h7d").innerText = days.in7Days - days.last24Hours;
	document.getElementById("b7d").innerText = days.total_open_issue - days.in7Days;
}

/**
 * function called when the entyered key stroked on the input box
 * params
 * 	{
 * 		event {object}  input box event object
 * 	}
 * 
 */
function repoEntered(event) {

	// checking if the key invoke is "Enter" key
	if (event.keyCode === 13 || event.which === 13) {
		repo = document.getElementById("repoName").value
		//checking if user has entered some value inside the input box
		if (!repo) {
			alert("fill the repository name first")
			return;
		}
		// if some value has been put inside the input box
		// we invokes the main function
		main()
	}
}
