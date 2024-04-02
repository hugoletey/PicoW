<?php
 session_start();
 if (isset($_SESSION['idm'])) $idm=$_SESSION['idm'];
 session_destroy();
 if (isset($idm)) $_SESSION['idm']=$idm;
?>