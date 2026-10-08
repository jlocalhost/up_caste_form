-- Local development sample data (same booths as the original prototype).
select public.import_booths('[
  {"district":"लखनऊ","assembly":"लखनऊ मध्य","booth_number":"159","booth_name":"प्राथमिक विद्यालय, हुसैनगंज","voters":864},
  {"district":"लखनऊ","assembly":"लखनऊ मध्य","booth_number":"160","booth_name":"आर्य कन्या इंटर कॉलेज","voters":938},
  {"district":"लखनऊ","assembly":"लखनऊ मध्य","booth_number":"161","booth_name":"नगर निगम विद्यालय, लालकुआँ","voters":756},
  {"district":"लखनऊ","assembly":"लखनऊ पूर्व","booth_number":"214","booth_name":"प्राथमिक विद्यालय, इंदिरा नगर","voters":1042},
  {"district":"लखनऊ","assembly":"लखनऊ पूर्व","booth_number":"215","booth_name":"सामुदायिक केंद्र, गोमती नगर","voters":889},
  {"district":"वाराणसी","assembly":"वाराणसी उत्तर","booth_number":"82","booth_name":"नगर निगम विद्यालय, चौकाघाट","voters":917},
  {"district":"वाराणसी","assembly":"वाराणसी उत्तर","booth_number":"83","booth_name":"प्राथमिक विद्यालय, नदेसर","voters":1084},
  {"district":"वाराणसी","assembly":"वाराणसी दक्षिण","booth_number":"112","booth_name":"कन्या पाठशाला, भेलूपुर","voters":795},
  {"district":"वाराणसी","assembly":"वाराणसी दक्षिण","booth_number":"113","booth_name":"संस्कृत विद्यालय, सोनारपुरा","voters":846},
  {"district":"गोरखपुर","assembly":"गोरखपुर शहर","booth_number":"304","booth_name":"पूर्व माध्यमिक विद्यालय, बेतियाहाता","voters":972},
  {"district":"गोरखपुर","assembly":"गोरखपुर शहर","booth_number":"305","booth_name":"प्राथमिक विद्यालय, रुस्तमपुर","voters":815},
  {"district":"प्रयागराज","assembly":"इलाहाबाद उत्तर","booth_number":"145","booth_name":"राजकीय बालिका विद्यालय, कटरा","voters":903},
  {"district":"प्रयागराज","assembly":"इलाहाबाद उत्तर","booth_number":"146","booth_name":"प्राथमिक विद्यालय, मम्फोर्डगंज","voters":774}
]'::jsonb);
