module.exports = {
  beforeCreate(event) {
    let { data } = event.params;
    console.log(data, "<<<");
    data.referral_code = Math.random().toString(36).slice(2);
  },
};
