<?php header("Content-Type: text/html;charset=utf-8");

	include 'functions.php';

	$con = connectToBBDD(); // Connexió a la BBDD

	$request = $_GET["request"]; // Agafem la petició passada

	if (!$con) {

		echo (false);
	
	} else {

		mysqli_set_charset($con, "utf8"); //formato de datos utf8
		$res = mysqli_query($con, $request); // Es realitza la petició al servidor

		if ($res != null) {

			$result = array(); //Array on anirem guardant la informació recollida
			// Recopilem la informació:
			$i = 0;
			while ($row = mysqli_fetch_array($res)) {
			
				$result[$i] = $row;
				$i++;
			}

			echo json_encode($result); // Retornem l'array en format JSON
		
		} else {

			echo (false);
			die();
		}
	}

	disconnectToBBDD($res, $con); // Desconnexió de la BBDD

?>