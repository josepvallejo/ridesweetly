<?php header("Content-Type: text/html;charset=utf-8");

	function connectToBBDD() {
		//Paràmetres de connexió
		$server = "bbdd.josepvallejo.com";
		$user = "ddb202062";
		$pass = "Qu7ZS,I87wf{";
		$bd = "ddb202062";
		//Realització de la connexió
		$con = mysqli_connect ($server, $user, $pass, $bd);

		return $con;
	}

	function disconnectToBBDD($res, $con) {

		mysqli_free_result($res); //Alliberem explícitament els recursos utilitzats després de la consulta
		mysqli_close($con); //Tanquem explícitament la connexió a la base de dades
	}
?>