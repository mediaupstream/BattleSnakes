// http://en.wikipedia.org/wiki/List_of_Mortal_Kombat_characters
var names=["Goro","Johnny Cage","Kano","Liu Kang","Raiden","Reptile","Scorpion","Shang Tsung","Sonya Blade","Sub-Zero","Baraka","Jade","Jax","Kintaro","Kitana","Kung Lao","Mileena","Noob Saibot","Shao Kahn","Smoke","Chameleon","Cyrax","Ermac","Kabal","Khameleon","Motaro","Nightwolf","Rain","Sektor","Sheeva","Sindel","Stryker","Fujin","Quan Chi","Kia","Jataaka","Sareena","Shinnok","Jarek","Kai","Meat","Reiko","Tanya","Blaze","Bo Rai Cho","Drahmin","Frost","Hsu Hao","Kenshi","Li Mei","Mokap","Moloch","Nitara","Ashrah","Dairou","Darrius","Havik","Hotaru","Kira","Kobra","Monster","Onaga","Shujinko","Daegon","Taven","Dark Kahn","Cyber Sub-Zero","Kratos","Skarlet","Belokk","Hornbuckle","Nimbus Terrafaux"];

var length = names.length;

exports.generate = function(){
	return names[ Math.floor( Math.random() * length + 1)];
};