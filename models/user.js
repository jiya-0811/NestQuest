const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;


const userSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true
  },

  // ❤️ SAVED / FAVORITE LISTINGS
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing"
    }
  ]

});


userSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model("User", userSchema);