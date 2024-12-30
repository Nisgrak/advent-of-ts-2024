enum Gift {
	Coal = 0,
	Train = 1,
	Bicycle = 2,
	SuccessorToTheNintendoSwitch = Gift.Bicycle << Gift.Train,
	TikTokPremium = Gift.SuccessorToTheNintendoSwitch << Gift.Train,
	Vape = Gift.TikTokPremium << Gift.Train,
	Traditional = Gift.Train | Gift.Bicycle,
	OnTheMove = Gift.Coal | Gift.Bicycle | Gift.TikTokPremium | Gift.Vape,
	OnTheCouch = Gift.Coal | Gift.SuccessorToTheNintendoSwitch | Gift.TikTokPremium | Gift.Vape
};
