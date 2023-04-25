<?php header("Content-Type: text/html;charset=utf-8");

	include 'functions.php';

	$con = connectToBBDD(); // Connexió a la BBDD

	$request = $_POST["request"]; // Agafem la petició passada

	if (!$con) {

		alert("Connexió OK");

		echo (false);
	
	} else {

		mysqli_set_charset($con, "utf8"); //formato de datos utf8
		$res = mysqli_query($con, $request); // Es realitza la petició al servidor

		if ($res != null) {

			echo (true);
		
		} else {

			echo (false);
			die();
		}
	}

	disconnectToBBDD($res, $con); // Desconnexió de la BBDD

?>