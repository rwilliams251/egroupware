<?php
  /**************************************************************************\
  * phpGroupWare - Calendar                                                  *
  * http://www.phpgroupware.org                                              *
  * Based on Webcalendar by Craig Knudsen <cknudsen@radix.net>               *
  *          http://www.radix.net/~cknudsen                                  *
  * --------------------------------------------                             *
  *  This program is free software; you can redistribute it and/or modify it *
  *  under the terms of the GNU General Public License as published by the   *
  *  Free Software Foundation; either version 2 of the License, or (at your  *
  *  option) any later version.                                              *
  \**************************************************************************/

  /* $Id$ */

  $matrix = $matrixtype;

  $phpgw_info["flags"] = array("currentapp" => "calendar", "enable_nextmatchs_class" => True, "parent_page" => "matrixselect.php");

  include("../header.inc.php");

  if (isset($date) && strlen($date) > 0) {
    $thisyear  = substr($date, 0, 4);
    $thismonth = substr($date, 4, 2);
    $thisday   = substr($date, 6, 2);
  } else {
    if (!isset($day) || !$day)
      $thisday = $phpgw->calendar->today["day"];
    else
      $thisday = $day;
    if (!isset($month) || !$month)
      $thismonth = $phpgw->calendar->today["month"];
    else
      $thismonth = $month;
    if (!isset($year) || !$year)
      $thisyear = $phpgw->calendar->today["year"];
    else
      $thisyear = $year;
    $date = $thisyear;
    $date .= ($thismonth<=9?"0":"").$thismonth;
    $date .= ($thisday<=9?"0":"").$thisday;

  }

//  $date = $thisyear.$thismonth.$thisday;

  if(isset($groups) && $groups) {
    for($i=0;$i<count($groups);$i++) {
      $phpgw->db->query("SELECT account_id FROM accounts WHERE account_groups LIKE '%,".$groups[$i].":%'");
      while($phpgw->db->next_record()) {
	$participating = False;
	for($j=0;$j<count($participants);$j++) {
	  if($participants[$j] == $phpgw->db->f("account_id")) {
	    $participating = True;
	  }
	}
	if(!$participating) $participants[] = $phpgw->db->f("account_id");
      }
    }
  }

  reset($participants);

  switch($matrixtype) {
    case "free/busy" :
      echo $phpgw->calendar->timematrix($phpgw->calendar->date_to_epoch($date),$phpgw->calendar->splittime("000000"),0,$participants);
      break;
    case "weekly" :
      echo $phpgw->calendar->display_large_week($thisday,$thismonth,$thisyear,true,$participants);
      break;
  }
  echo "<center>";
  echo "<form action=\"".$phpgw->link("viewmatrix.php")."\" method=\"post\" name=\"matrixform\" target=\"viewmatrix\">";
  echo "<input type=\"hidden\" name=\"date\" value=\"".$date."\">";
  echo "<input type=\"hidden\" name=\"matrixtype\" value=\"".$matrix."\">";
  for ($i=0;$i<count($participants);$i++)
    echo "<input type=\"hidden\" name=\"participants[]\" value=\"".$participants[$i]."\">";
  if(isset($filter) && $filter) {
    echo "<input type=\"hidden\" name=\"filter\" value=\"".$filter."\">";
  }
  echo "<input type=\"submit\" value=\"Refresh\">";
  echo "</form>";
  echo "</center>";

  $phpgw->common->phpgw_footer();
?>
