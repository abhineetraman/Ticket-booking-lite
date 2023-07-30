const store = new Vuex.Store({
    state: {
        uname : "",
        show : null,
        theatre : null,
        vid : "",
        sid : "",
        search_show: null,
        search_theatre: null,
    },
    mutations: {
        change_uname: (state,username) => {
            state.uname = username;
        },

        show_state: (state, s) => {
            state.show = s;
        },

        theatre_state: (state, t) => {
            state.theatre = t;
        },

        vid_state: (state, vid) => {
            state.vid = vid;
        },

        sid_state: (state, sid) => {
            state.sid = sid;
        },

        search_show_state: (state, ss) => {
            state.search_show = ss;
        },

        search_theatre_state: (state, st) => {
            state.search_theatre == st;
        },
    }
});

const search_home = Vue.component("search_home", {
    template: `
        <div style="background: #1F1F1F; color: #121212;">
            <nav class="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
                <div class="container-fluid" style="font-size: 20px;">
                    <p v-if="uname" style="color: white; margin-top: auto; margin-bottom: auto;"> {{ uname }} 's Dashboard</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="mynavbar">
                        <ul class="navbar-nav me-auto">
                            <input class="form-control me-2" type="text" placeholder="Search" v-model="Search">
                            <button class="btn btn-primary" type="button" v-on:click="search">Search</button>
                        </ul>
                        <form class="d-flex">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item" v-on:click="btn_profile">
                                <a class="nav-link">Profile</a>
                                </li>
                                <li class="nav-item" v-on:click="btn_bookings">
                                <a class="nav-link">My Bookings</a>
                                </li>
                                <li class="nav-item" v-on:click="btn_logout">
                                <a class="nav-link">Logout</a>
                                </li>
                            </ul>
                        </form>
                    </div>
                </div>
            </nav>

            <div v-if="count" style="padding: 80px;">
                <div v-for="item in venue">
                    <div class="container" style="padding: 15px; width:100%;">
                        <div class="card" style="background-color:#F1ABB9;">
                            <div class="card-body" style="background-color:#F1FBB9;" :id="item.id">
                                <h4 class="card-title"> <b>{{ item.name }}, {{ item.place }} </b><span style="float:right;"> {{ item.location }} </span></h4>
                                <div v-if="scount">
                                    <div v-for="i in filter_show(item.id)">
                                        <div class="container" style="padding: 15px;">
                                            <div class="row">
                                                <div class="col-sm-12" style="background-color:#3F9F59;" :id="i.id">
                                                    <h4 class="card-title"> <b>{{ i.name }} </b><span style="float:right;"> {{ i.timing }} </span></h4>
                                                    <br>
                                                    <img :src="i.img_link" style="height: 240px; width: 100%;" />
                                                    <p><b> Tags: </b>{{ i.tags }}</p>
                                                    <p><b> Price: </b> ₹{{ i.price }}</p>
                                                    <p><b> Rating: </b> {{ i.rating }}</p>
                                                    <button v-on:click="book(i.id)" class="btn btn-primary"> Book </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <br>
                                </div>
                                <div v-else style="text-align:center; font-size:32px; display:flex ; align-items:center; justify-content:center; flex-direction:column;">
                                    <p> No Shows Available </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else style="text-align:center; font-size:32px; display:flex ; align-items:center; justify-content:center; flex-direction:column; padding: 180px;">
                <p style="padding:80px;">No Shows Available</p>
            </div>
        </div>
    `,

    data: function(){
        return{
            uname: this.$store.state.uname,
            count: 0,
            scount: 0,
            theatre: null,
            show: null,
            Search: ""
        }
    },

    methods: {
        btn_profile: function(){
            router.push(`/home/${this.uname}/profile`);
        },

        btn_bookings: function(){
            router.push(`/home/${this.uname}/bookings`);
        },

        btn_logout: function(){
            router.push(`/`);
        },

        search: function(){
            len = this.show.length;
            len1 = this.theatre.length;
            for(let i=0; i<len; i++){
                if (i<len1 && this.Search === theatre[i].location){
                    show = this.show;
                    theatre = this.$store.state.theatre.filter((n) => n.location === this.Search);
                    this.$store.commit('search_show_state', show);
                    this.$store.commit('search_theatre_state', theatre);

                    return router.push(`/home/search/${this.uname}`);
                }

                else if (this.Search === show[i].rating){
                    theatre = this.theatre;
                    show = this.show.filter((n) => n.rating >= this.Search);
                    this.$store.commit('search_show_state', show);
                    this.$store.commit('search_theatre_state', theatre);

                    return router.push(`/home/search/${this.uname}`);
                }

                else if (show[i].tags.search(this.Search)){
                    theatre = this.theatre;
                    show = this.show.filter((n) => n.tags.search(this.Search));
                    this.$store.commit('search_show_state', show);
                    this.$store.commit('search_theatre_state', theatre);

                    return router.push(`/home/search/${this.uname}`);
                }
            }
        },

        filter_show: function(tid){
            return this.show.filter((n) => n.t_id == tid);
        },

        book: function(id){
            url = "http://localhost:5000/api/seats/".concat(id).concat(this.uname);
            fetch(url ,{
                method: "POST",
                headers : {
                    'Content-type' : 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                }
            })
            .then(response => response.json());

            sid = this.show.filter((n) => n.id == id);
            this.$store.commit('sid_state', sid);
            console.log(sid); 
            return router.push(`/home/${this.uname}/${id}/book`);
        }
    },

    computed:{
        venue_val: function(){
         val =  this.$store.state.search_theatre;
         if (val.length > 0)
             this.count = val.length;
         let c = this.$store.state.search_show;
         if (c.length > 0)
             this.scount = c.length;
         return val;
        },
 
        data: function(){
               this.show = this.$store.state.search_show;
               this.theatre = this.$store.state.search_theatre;
        }
    }
})

const edit_show = Vue.component("edit_show", {
    template: `
        <div>
            <nav class="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
                <div class="container-fluid" style="font-size: 20px;">
                    <p v-if="uname" style="color: white; margin-top: auto; margin-bottom: auto;"> {{ uname }} 's Dashboard</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="mynavbar" style="float: right; text-align: right;">
                        <ul class="nav navbar-nav navbar-right" style="float: right; text-align: right;">
                            <li class="nav-item">
                            <a class="nav-link" v-on:click="btn_home">Dashboard</a>
                            </li>
                            
                            <li class="nav-item">
                            <a class="nav-link" v-on:click="btn_summary">Summary</a>
                            </li>
                            
                            <li class="nav-item" v-on:click="btn_logout">
                            <a class="nav-link">Logout</a>
                            </li>

                        </ul>
                        
                    </div>
                </div>
            </nav>
            <form style="margin-top: 80px; text-align:center;  display:flex ; align-items:center; justify-content:center; flex-direction:column;">
                <p style="font-family: Lucida Sans; font-size: 40px;">Edit the Show</p>

                <div class="mb-3 mt-3">
                <label> Show Name: </label>
                <input type="text" class="form-control" v-model="name" required style="border: none; border-bottom: 3px solid black"/>
                </div>

                <div class="mb-3">
                <label> Image Link: </label>
                <input type="text" class="form-control" v-model="img_link" required style="border: none; border-bottom: 3px solid black"/>
                </div>

                <button class="btn btn-primary" type="submit" v-on:click="add_show"> Add </button>
            </form>
        </div>
    `,

    data: function(){
        return{
            uname: store.state.uname,
            sid: "",
            name: "",
            img_link: null,
        }
    },

    methods: {
        add_show: function(){
            if (this.name === "")
                this.name = null;
            if (this.img_link === "")
                this.img_link = null;
            udata = {
                "name": this.name,
                "img_link": this.img_link,
            };
            url = "http://localhost:5000/api/show/put/".concat(this.sid).concat(this.uname);
            fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                },
                body: JSON.stringify(udata),
            })
            .then(response => response.json());
            router.push(`/root/${this.uname}`);
        },

        btn_home: function(){
            return router.push(`/root/${this.uname}`);
        },

        btn_summary: function(){
            return router.push(`/root/${this.uname}/summary`);
        },

        btn_logout: function(){
            return router.push(`/`);
        }
    },

    created: function(){
        this.sid = this.$store.state.sid;
    }
})

const summary_graph = Vue.component("summary-graph", {
    template: `
        <div>
            <nav class="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
                <div class="container-fluid" style=" font-size: 20px;">
                    <p style="text-align: right; color: white; margin-top: auto; margin-bottom: auto;"> Summary </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="mynavbar">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item" style="vertical-align: bottom;" v-on:click="btn_dashboard">
                            <a  class="nav-link">Dashboard</a>
                            </li>
                            
                            <li class="nav-item">
                            <a class="nav-link" href="/">Logout</a>
                            </li>

                        </ul> 
                    </div>
                </div>
            </nav>
            <div id="graph" style="text-align: center; font-size: 20px; padding: 80px;">
                Popularity Trend
                <br>
                <img src="../static/graph.png">
                <p style="text-align: right; font-size: 10px;"> *(based on No. of tickets booked) </p>
            </div>
            
        </div>
    `,

    data: function(){
        return{
            uname: this.$store.state.uname
        }
    },

    methods: {
        btn_dashboard : function(){
            return router.push(`/root/${this.uname}`)
        }
    },

    beforeCreate(){

    }
})

const profile = Vue.component("profile", {
    template: `
        <div>
            <nav class="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
                <div class="container-fluid" style="font-size: 20px;">
                    <p v-if="uname" style="color: white; margin-top: auto; margin-bottom: auto;"> {{ uname }} 's Dashboard</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="mynavbar">
                        <form class="d-flex">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item" v-on:click="btn_home">
                                <a class="nav-link">Home</a>
                                </li>
                                <li class="nav-item" v-on:click="btn_bookings">
                                <a class="nav-link">My Bookings</a>
                                </li>
                                <li class="nav-item" v-on:click="btn_logout">
                                <a class="nav-link">Logout</a>
                                </li>
                            </ul>
                        </form>
                    </div>
                </div>
            </nav>

            <p style="text-align: center; font-face: bold; font-size: 24px; margin-top: 80px;">Your Profile</p>
            <div class="container">
                <div class="row">
                    <div class="col-sm-3">

                    </div>
                    <div class="col-sm-6">
                        <form style="text-align: justify;">
                            <p>  
                            <label> First Name: </label>
                            <input type="text" v-model="fname" />

                            <span style="float:right;">
                            <label> Last Name: </label>
                            <input type="text" v-model="lname" />
                            </span></p>

                            <div class="mt-3 mb-3">
                            <label> Date of Birth:  </label>
                            <input type="date" v-model="dob" class="form-control" />
                            </div>

                            <div class="mb-3">
                            <label> Mobile Number: </label>
                            <input type="text" v-model="phone" minlength="10" maxlength="10" required class="form-control" />
                            </div>

                            <button class="btn btn-primary" type="submit" v-on:click="Save"> Save </button>
                        </form>
                    </div>
                    <div class="col-sm-3">
                        
                    </div>
                </div>
            </div>
        </div>
    `,

    data: function(){
        return{
            uname: this.$store.state.uname,
            fname: "",
            lname: "",
            dob: "",
            phone: ""
        }
    },

    methods: {
        Save: function(){
            if (this.uname === "" || this.fname === "" || this.lname === "" || this.dob === "" || this.phone === "")
                return javascript.void(0);
            req_data = {
                "uname" : this.uname,
                "fname" : this.fname,
                "lname" : this.lname,
                "dob" : this.dob,
                "phone" : this.phone
            };

            url = "/api/profile".concat(this.uname)
            fetch(url , {
                method: "POST",
                headers:{ 
                    "Content-Type" :"application/json",
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                },
                body: JSON.stringify(req_data)
            })
            .then(response => response.json())
            .then(data => console.log(data));

            router.replace(`/home/${this.uname}/profile`);
        },

        btn_bookings: function(){
            return router.push(`/home/${this.uname}/bookings`);
        },

        btn_home: function(){
            return router.push(`/home/${this.uname}`);
        },

        btn_logout: function(){
            return router.push(`/`);
        }
    },  

    created(){
        url = "/api/profile/".concat(this.uname)
        fetch(url, {
            method : "GET",
            headers : {
                'Content-type' : 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        })
        .then(response => response.json())
        .then(data => {
            this.fname = data.fname;
            this.lname = data.lname;
            this.dob = data.dob;
            this.phone = data.phone;
        })
    },

    computed: {
        
    }
})

const bookings = Vue.component("bookings", {
    template: `
        <div>
            <nav class="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
                <div class="container-fluid" style="font-size: 20px;">
                    <p v-if="uname" style="color: white; margin-top: auto; margin-bottom: auto;"> {{ uname }} 's Dashboard</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="mynavbar">
                        <form class="d-flex">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item" v-on:click="btn_profile">
                                <a class="nav-link">Profile</a>
                                </li>
                                <li class="nav-item" v-on:click="btn_home">
                                <a class="nav-link">Dashboard</a>
                                </li>
                                <li class="nav-item" v-on:click="btn_logout">
                                <a class="nav-link">Logout</a>
                                </li>
                            </ul>
                        </form>
                    </div>
                </div>
            </nav>

            <p style="font-face: bold; font-size: 24px; margin-top: 80px; text-align: center;">Your Bookings</p>
            <div v-for="item in bookings">    
                <div class="container" style="color:#DEDEDE;" :id="item.b_id">
                    <div class="list-group" style="padding: 5px;" >
                        <li class="list-group-item" style="verical-align: middle;">
                            {{ item.s_name }} <b> &ensp; Ticket Booked - {{ item.quantity }} </b>
                            <span class="text-center" style="display: block; margin-left: auto; margin-right: auto;"> {{item.date }} - {{ item.timing }} </span> 
                            <div style="float: right;">
                                ⭐ {{ item.rating }} / 5
                                <input type="range" v-model="rating" min="0" max="5" :id="item.b_id" v-if="rate_check(item.rating)">
                                <button class="btn btn-warning" v-if="rate_check(item.rating)" type="submit" v-on:click="rate(item.b_id)">Rate</button>
                            </div>
                        </li>
                    </div>
                </div>
            </div>
        </div>
    `,

    data: function(){
        return{
            uname: this.$store.state.uname,
            rating : "",
            bookings: [{"t_name": "venue_1", "s_name" : "show_2", "timing": "10:30 - 12:30"}, {"t_name": "venue_2", "s_name" : "show_1", "timing": "12:30 - 2:45"}]
            
        }
    },

    methods: {
        rate: function(id){
            if (this.rating === "" || this.bid === "")
                return javascript.void(0);
            req_data = {
                "rating" : this.rating,
                "bid" : id
            };

            url ="/api/bookings".concat(this.uname)
            fetch(url , {
                method: "PUT",
                headers: {
                    "Content-Type" : "application/json",
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                },
                body: JSON.stringify(req_data),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                router.replace(`/home/${this.uname}/bookings`);
            });

            return router.replace(`/home/${this.uname}/bookings`)
        },

        rate_check: function(rating){
            if (rating === "-")
                return true;
            else
                return false;
        },

        btn_home: function(){
            return router.push(`/home/${this.uname}`);
        },

        btn_profile: function(){
            return router.push(`/home/${this.uname}/profile`);
        },

        btn_logout: function(){
            return router.push(`/`);
        }
    },

    created(){
        url = "http://localhost:5000/api/bookings/".concat(this.uname);
        fetch(url, {
            method : "GET",
            headers : {
                'Content-type' : 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.bookings = data;
            });
    },

    computed: {
        
    }
})

const book_ticket = Vue.component("book-ticket", {
    template: `
        <div style="background: #121212; color:#EDEDED">
            <nav class="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
                <div class="container-fluid" style="font-size: 20px;">
                    <p v-if="uname" style="color: white; margin-top: auto; margin-bottom: auto;"> {{ uname }} 's Dashboard</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="mynavbar">
                        <form class="d-flex">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item" v-on:click="btn_home">
                                <a class="nav-link">Home</a>
                                </li>

                                <li class="nav-item" v-on:click="btn_profile">
                                <a class="nav-link">Profile</a>
                                </li>

                                <li class="nav-item" v-on:click="btn_bookings">
                                <a class="nav-link">My Bookings</a>
                                </li>

                                <li class="nav-item" v-on:click="btn_logout">
                                <a class="nav-link">Logout</a>
                                </li>
                            </ul>
                        </form>
                    </div>
                </div>
            </nav>

            <div v-for="i in sid">
                <p style="font-face: bold; font-size: 24px; margin-top: 80px;">Booking - {{ i.name }} <span style="float: right;"> Time: {{ i.timing }} </span></p>
            </div

            <form style="margin-top: 80px; text-align:center;  display:flex ; align-items:center; justify-content:center; flex-direction:column;">
                
            <p style="font-face: bold; font-size: 24px;">Available Tickets: {{ seat }}</p>

                <div class="mb-3 mt-3">
                <label> Quantity </label>
                <input type="number" class="form-control" v-model="quantity"  v-on:keyup="total_p" required style="border: none; border-bottom: 3px solid black"/>
                </div>

                <div class="mb-3">
                <label> Price </label>
                <input type="number" class="form-control" v-model="price" readonly style="border: none; border-bottom: 3px solid black"/>
                </div>

                <div class="mb-3">
                <label> Total </label>
                <input type="number" class="form-control" v-model="total" readonly  style="border: none; border-bottom: 3px solid black"/>
                </div>

                <button class="btn btn-primary" type="submit" v-on:click="book_ticket"> Book </button>
            </form>
        </div>
    `,

    data: function(){
        return{
            uname: this.$store.state.uname,
            sid: this.$store.state.sid,
            timing: "",
            booking_date: "",
            price: 0,
            quantity: 2,
            seat: 0,
            total: "",
        }
    },

    methods: {
        book_ticket: function(id){
            if (this.seat > this.quantity){
                const date = new Date();
                this.booking_date = String(date).slice(4,15);
                if (this.uname === "" || this.booking_date === "" || this.sid === "" || this.quantity === "")
                    return javascript.void(0);
                req_data = {
                    "uname" : this.uname,
                    "booking_date" : this.booking_date,
                    "sid" : this.sid[0].id,
                    "quantity" : this.quantity
                }

                url = "/api/bookings".concat(this.uname);
                fetch(url , {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                    },
                    body: JSON.stringify(req_data),
                })
                .then(response => response.json())
                .then(data => { 
                    alert("Ticket Booked");
                    return router.push(`/home/${this.uname}`);
                });
            }

        },

        total_p : function(){
            this.total = this.price * this.quantity;
        },

        btn_home: function(){
            return router.push(`/home/${this.uname}`);
        },

        btn_bookings: function(){
            return router.push(`/home/${this.uname}/bookings`);
        },

        btn_profile: function(){
            return router.push(`/home/${this.uname}/profile`);
        },

        btn_logout: function(){
            return router.push(`/`);
        }
    },

    created: function(){
    },

    computed:{
        func: function(){
            this.price = this.sid[0].price;
            this.total = this.price * this.quantity;

            url = "/api/seats/".concat(this.sid[0].id).concat(this.uname);
            fetch(url, {
                method : "GET",
                headers : {
                    'Content-type' : 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                }
            })
            .then(response => response.json())
            .then(data => {this.seat = data.available})
        }
    }
})

const add_show = Vue.component("show", {
    template: `
        <div>
            <nav class="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
                <div class="container-fluid" style="font-size: 20px;">
                    <p v-if="uname" style="color: white; margin-top: auto; margin-bottom: auto;"> {{ uname }} 's Dashboard</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="mynavbar" style="float: right; text-align: right;">
                        <ul class="nav navbar-nav navbar-right" style="float: right; text-align: right;">
                            <li class="nav-item">
                            <a class="nav-link" v-on:click="btn_home">Dashboard</a>
                            </li>
                            
                            <li class="nav-item">
                            <a class="nav-link" v-on:click="btn_summary">Summary</a>
                            </li>
                            
                            <li class="nav-item" v-on:click="btn_logout">
                            <a class="nav-link">Logout</a>
                            </li>

                        </ul>
                        
                    </div>
                </div>
            </nav>
            <form style="margin-top: 80px; text-align:center;  display:flex ; align-items:center; justify-content:center; flex-direction:column;">
                <p style="font-family: Lucida Sans; font-size: 40px;">Add a new Show</p>

                <div class="mb-3 mt-3">
                <label> Show Name: </label>
                <input type="text" class="form-control" v-model="sname" required style="border: none; border-bottom: 3px solid black"/>
                </div>

                <div class="mb-3">
                <label> Image Link: </label>
                <input type="text" class="form-control" v-model="img_link" required style="border: none; border-bottom: 3px solid black"/>
                </div>

                <div class="mb-3">
                <label> Start Time: </label>
                <input type="time" class="form-control" v-model="stime" required style="border: solid; border-bottom: 3px solid black"/>
                <br>
                <label> End Time: </label>
                <input type="time" class="form-control" v-model="etime" required style="border: solid; border-bottom: 3px solid black"/>
                </div>

                <div class="mb-3">
                <label> tags: </label>
                <input type="text" class="form-control" v-model="tags" required style="border: none; border-bottom: 3px solid black"/>
                </div>

                <div class="mb-3">
                <label> Price: </label>
                <input type="number" class="form-control" v-model="price" required style="border: none; border-bottom: 3px solid black"/>
                </div>

                <div class="mb-3">
                <label> Total Seats: </label>
                <input type="number" class="form-control" v-model="seats" required style="border: none; border-bottom: 3px solid black"/>
                </div>

                <button class="btn btn-primary" type="submit" v-on:click="add_show"> Add </button>
            </form>
        </div>
    `,

    data: function(){
        return{
            uname: store.state.uname,
            vid: "",
            sname: "",
            stime: "",
            etime: "",
            tags: "",
            img_link: "",
            price: 0,
            seats: 0
        }
    },

    methods: {
        add_show: function(){
            if (this.sname === "" || this.stime === "" || this.etime === "" || this.price === "" || this.tags === "" || this.img_link === "" || this.vid === "" || this.seats === "")
                return javascript.void(0);
            data = {
                "sname": this.sname,
                "stime": this.stime,
                "etime": this.etime,
                "tags": this.tags,
                "price": this.price,
                "img_link": this.img_link,
                "vid": this.vid,
                "seats": this.seats
            };
            url = "http://localhost:5000/api/show/post/".concat(this.vid).concat(this.uname);
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(router.push(`/root/${this.uname}`));
        },

        btn_home: function(){
            return router.push(`/root/${this.uname}`);
        },

        btn_summary: function(){
            return router.push(`/root/${this.uname}/summary`);
        },

        btn_logout: function(){
            return router.push(`/`);
        }
    },

    created: function(){
        this.vid = this.$store.state.vid;
    }
})


const add_venue = Vue.component("venue", {
    template: `
        <div>
            <nav class="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
                <div class="container-fluid" style="font-size: 20px;">
                    <p v-if="uname" style="color: white; margin-top: auto; margin-bottom: auto;"> {{ uname }} 's Dashboard</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="mynavbar" style="float: right; text-align: right;">
                        <ul class="nav navbar-nav navbar-right" style="float: right; text-align: right;">
                            <li class="nav-item">
                            <a class="nav-link" v-on:click="btn_home">Dashboard</a>
                            </li>
                            
                            <li class="nav-item">
                            <a class="nav-link" v-on:click="btn_summary">Summary</a>
                            </li>
                            
                            <li class="nav-item" v-on:click="btn_logout">
                            <a class="nav-link">Logout</a>
                            </li>
 
                        </ul>
                        
                    </div>
                </div>
            </nav>
            <form style="margin-top: 80px; text-align:center;  display:flex ; align-items:center; justify-content:center; flex-direction:column;">
                <p style="font-family: Lucida Sans; font-size: 40px;">Add a new Venue</p>
                <div class="flex-container" style="display: inline-block; margin: auto;">
                    <div class="mb-3 mt-3">
                    <label> Venue Name: </label>
                    <input type="text" class="form-control" v-model="vname" required style="border: none; border-bottom: 3px solid black"/>
                    </div class="mb-3">

                    <div class="mb-3">
                    <label> Place: </label>
                    <input type="text" class="form-control" v-model="place" required style="border: none; border-bottom: 3px solid black"/>
                    </div>

                    <div class="mb-3">
                    <label> Location: </label>
                    <input type="text" class="form-control" v-model="location" required style="border: none; border-bottom: 3px solid black"/>
                    </div>

                    <div class="mb-3">
                    <label> Capacity: </label>
                    <input type="text" class="form-control" v-model="capacity" required style="border: none; border-bottom: 3px solid black"/>
                    </div>

                    <button class="btn btn-primary" type="submit" v-on:click="add_venue"> Add </button>
                </div>
            </form>
        </div>
    `,

    data: function(){
        return{
            uname: store.state.uname,
            vname: "",
            place: "",
            location: "",
            capacity: ""
        }
    },

    methods: {
        add_venue: function(){
            if (this.vname === "" || this.place === "" || this.location === "" || this.capacity === "")
                return javascript.void(0);
            data = {
                "vname": this.vname,
                "place": this.place,
                "location": this.location,
                "capacity": this.capacity
            };
            url = "http://localhost:5000/api/Theatre/POST".concat(this.uname)
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(router.push(`/root/${this.uname}`));
        },
        
        btn_home: function(){
            return router.push(`/root/${this.uname}`);
        },

        btn_summary: function(){
            return router.push(`/root/${this.uname}/summary`);
        },

        btn_logout: function(){
            return router.push(`/`);
        }
    },

    beforeCreate(){

    }
})

const home = Vue.component("home", {
    template: `
        <div style="background: #1F1F1F; color: #121212;">
            <nav class="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
                <div class="container-fluid" style="font-size: 20px;">
                    <p v-if="uname" style="color: white; margin-top: auto; margin-bottom: auto;"> {{ uname }} 's Dashboard</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="mynavbar">
                        <ul class="navbar-nav me-auto">
                            <input class="form-control me-2" type="text" placeholder="Search" v-model="Search">
                            <button class="btn btn-primary" type="button" v-on:click="Search1">Search</button>
                        </ul>
                        <form class="d-flex">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item" v-on:click="btn_profile">
                                <a class="nav-link">Profile</a>
                                </li>
                                <li class="nav-item" v-on:click="btn_bookings">
                                <a class="nav-link">My Bookings</a>
                                </li>
                                <li class="nav-item" v-on:click="btn_logout">
                                <a class="nav-link">Logout</a>
                                </li>
                            </ul>
                        </form>
                    </div>
                </div>
            </nav>

            <div v-if="count" style="padding: 80px;">
                <div v-for="item in venue">
                    <div class="container" style="padding: 15px; width:100%;">
                        <div class="card" style="background-color:#F1ABB9;">
                            <div class="card-body" style="background-color:#F1FBB9;" :id="item.id">
                                <h4 class="card-title"> <b>{{ item.name }}, {{ item.place }} </b><span style="float:right;"> {{ item.location }} </span></h4>
                                <div v-if="scount">
                                    <div v-for="i in filter_show(item.id)">
                                        <div class="container" style="padding: 15px;">
                                            <div class="row">
                                                <div class="col-sm-12" style="background-color:#3F9F59;" :id="i.id">
                                                    <h4 class="card-title"> <b>{{ i.name }} </b><span style="float:right;"> {{ i.timing }} </span></h4>
                                                    <br>
                                                    <img :src="i.img_link" style="height: 240px; width: 100%;" />
                                                    <p><b> Tags: </b>{{ i.tags }}</p>
                                                    <p><b> Price: </b> ₹{{ i.price }}</p>
                                                    <p><b> Rating: </b> {{ i.rating }}</p>
                                                    <button v-on:click="book(i.id)" class="btn btn-primary"> Book </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <br>
                                </div>
                                <div v-else style="text-align:center; font-size:32px; display:flex ; align-items:center; justify-content:center; flex-direction:column;">
                                    <p> No Shows Available </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else style="text-align:center; font-size:32px; display:flex ; align-items:center; justify-content:center; flex-direction:column; padding: 180px;">
                <p style="padding:80px;">No Shows Available</p>
            </div>
        </div>
    `,

    data: function(){
        return{
            uname: this.$store.state.uname,
            count: 0,
            scount: 0,
            venue: null,
            show: null,
            Search: ""
        }
    },

    methods: {
        btn_profile: function(){
            router.push(`/home/${this.uname}/profile`);
        },

        btn_bookings: function(){
            router.push(`/home/${this.uname}/bookings`);
        },

        btn_logout: function(){
            router.push(`/`);
        },

        Search1: function(){
            len = this.scount;
            len1 = this.count;
            for(let i=0; i<len; i++){
                if (i<len1 && this.Search === this.venue[i].location){
                    show = this.show;
                    theatre = this.venue.filter((n) => n.location === this.Search);
                    this.$store.commit('search_show_state', show);
                    this.$store.commit('search_theatre_state', theatre);

                    return router.push(`/home/search/${this.uname}`);
                }

                else if (Number.isInteger(Number(this.Search))){
                    theatre = this.venue;
                    show = this.show.filter((n) => n.rating >= this.Search);
                    this.$store.commit('search_show_state', show);
                    this.$store.commit('search_theatre_state', theatre);

                    return router.push(`/home/search/${this.uname}`);
                }

                else if (this.show[i].tags.search(this.Search)){
                    theatre = this.show;
                    show = this.show.filter((n) => n.tags.search(this.Search));
                    this.$store.commit('search_show_state', show);
                    this.$store.commit('search_theatre_state', theatre);

                    return router.push(`/home/search/${this.uname}`);
                }
            }
        },

        filter_show: function(tid){
            return this.show.filter((n) => n.t_id == tid);
        },

        book: function(id){
            url = "http://localhost:5000/api/seats/".concat(id).concat(this.uname);
            fetch(url ,{
                method: "POST",
                headers : {
                    'Content-type' : 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                }
            })
            .then(response => response.json());

            sid = this.show.filter((n) => n.id == id);
            this.$store.commit('sid_state', sid);
            console.log(sid); 
            return router.push(`/home/${this.uname}/${id}/book`);
        }
    },

    beforeMount: function() {
        fetch("http://localhost:5000/api/Theatre/GET", {
            method: "GET",
            mode: 'cors',
            headers: {
                'Content-type' : 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        })
        .then(response => response.json())
        .then(data => {
            this.$store.commit('theatre_state', data);
            this.venue = data;
        });
        fetch("http://localhost:5000/api/show/GET",{
            method: "GET",
            headers: {
                'Content-type' : 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        })
        .then(response => response.json())
        .then(data => {
            this.$store.commit('show_state', data);
            this.show = data;
        });

        val =  this.$store.state.theatre;
        if (val.length > 0)
            this.count = val.length;
        let c = this.$store.state.show;
        if (c.length > 0)
            this.scount = c.length;
        return val;
    },

    computed:{
        
    }
})

const dashboard = Vue.component("dashboard", {
    template:`
        <div style="background-color:#121212; color:#121212;">
            <nav class="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
                <div class="container-fluid" style="font-size: 20px;">
                    <p v-if="uname" style="color: white; margin-top: auto; margin-bottom: auto;"> {{ uname }} 's Dashboard</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="mynavbar">
                        <ul class="nav navbar-nav navbar-right">
                          
                            <li class="nav-item">
                            <a class="nav-link" v-on:click="btn_summary">Summary</a>
                            </li>
                            
                            <li class="nav-item" v-on:click="btn_logout">
                            <a class="nav-link">Logout</a>
                            </li>
 
                        </ul>
                        
                    </div>
                </div>
            </nav>
            <div v-if="count" style="padding: 80px;">
                <div v-for="item in venue">
                    <div class="container" style="padding: 15px;">
                        <div class="card" style="background-color:#F1ABB9;">
                            <div class="card-body" style="background-color:#F1FBB9;" :id="item.id">
                                <h4 class="card-title"> <b>{{ item.name }}, {{ item.place }} </b><span style="float:right;"> {{ item.location }} </span></h4>
                                <br>
                                <div v-if="scount">
                                    <div v-for="i in filter_show(item.id)">
                                        <div class="container" style="padding: 15px;">
                                            <div class="row">
                                                <div class="col" style="background-color:#FF6B6A;" :id="i.id">
                                                    <h4 class="card-title"> <b>{{ i.name }} </b><span style="float:right;"> {{ i.timing }} </span></h4>
                                                    <br>
                                                    <img :src="i.img_link" style="height: 240px; width: 100%;" />
                                                    <p><b> Tags: </b>{{ i.tags }}</p>
                                                    <p><b> Price: </b> ₹{{ i.price }}</p>
                                                    <p><b> Rating: </b> {{ i.rating }}</p>
                                                    <button v-on:click="edit_show(i.id)" class="btn btn-dark"> Edit </button>
                                                    <button v-on:click="delete_show(i.id)" class="btn btn-dark"> Delete </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button v-on:click="add_show(item.id)" class="btn btn-primary" style="border-radius: 60%;"> + </button>
                                    <br>
                                </div>
                                <div v-else style="text-align:center; font-size:32px; display:flex ; align-items:center; justify-content:center; flex-direction:column;">
                                    <p> No Shows created </p>
                                    <button v-on:click="add_show(item.id)" class="btn btn-primary" style="border-radius: 60%; font-size: 40px"> + </button>
                                </div>
                                <br>
                                <button v-on:click="edit_venue(item.id)" class="btn btn-dark"> Edit </button>
                                <button v-on:click="delete_venue(item.id)" class="btn btn-dark"> Delete </button>

                                <button v-on:click="expert(item.id)" class=" btn btn-dark" style="text-align: right;"> Export </button>
                            </div>
                        </div>
                    </div>
                </div>
                <br>
                <button v-on:click="add_venue" class="btn btn-primary" style="border-radius: 60%; margin: auto; text-align: center; font-size: 40px;"> + </button>
            </div>
            <div v-else style="text-align:center; font-size:32px; display:flex ; align-items:center; justify-content:center; flex-direction:column; padding: 180px;">
                <p style="padding:80px; color: #EDEDED">No Shows or Venue created</p>
                <button v-on:click="add_venue" class="btn btn-primary" style="border-radius: 60%; font-size: 40px"> + </button>
            </div>
        </div>
    `,

    data: function(){
        return{
            count: 0,
            scount: 0,
            uname: this.$store.state.uname,
            venue: this.$store.state.theatre,
            show: this.$store.state.show
        }
    },
    methods: {
        delete_venue: function(id){
            let text = "Press a button!\nEither Delete or Cancel.";
            if (confirm(text) == true) {
                url = "http://localhost:5000/api/Theatre/".concat(id).concat(this.uname)
                fetch(url, {
                    method: "DELETE",
                    headers: {
                        'Content-type' : 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                    }
                })
                .then(response => {
                    return response.json( )
                })
                .then(data => 
                    // this is the data we get after putting our data, do whatever you want with this data
                    console.log(data));
            } 
            else {
                text = "You canceled!";
            }
            return router.replace(`/root/${this.uname}`);
        },
        
        edit_venue: function(id){
            let text;
            let venue = prompt("Please enter the name:");
            if (venue == null || venue == "") {
                text = "User cancelled the prompt.";
            } 
            else {
                text = venue;
                if (text === "" || text === null)
                    return javascript.void(0);
                data_changed = { "name" : text };
                url = "http://localhost:5000/api/Theatre/".concat(id).concat(this.uname);
                fetch(url, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                    },
                    body: JSON.stringify(data_changed),
                })
                .then(response => {
                    return response.json()
                });
            }
            return router.replace(`/root/${this.uname}`);
        },

        add_venue: function(){
            return router.push(`/root/${this.uname}/venue`);
        },

        add_show: function(id){
            this.$store.commit('vid_state', id);
            return router.push(`/root/${this.uname}/venue/${id}/show`);
        },

        delete_show: function(id){
            let text = "Press a button!\nEither Delete or Cancel.";
            if (confirm(text) == true) {
                url = "http://localhost:5000/api/show/DELETE/".concat(id).concat(this.uname)
                fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-type' : 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                    }
                });
            } 
            else {
                text = "You canceled!";
            }
            return router.go();
        },

        edit_show: function(id){
            this.$store.commit('sid_state', id);
            return router.push(`/root/${this.uname}/show/${id}/edit`);
        },

        btn_summary: function(){
            url = "/api/summary/GET".concat(this.uname)
            fetch(url, {
                method: "GET",
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                }
            })
            .then(response => response.json())
            .then(data => javascript.void(0))
            return router.push(`/root/${this.uname}/summary`);
        },

        filter_show: function(tid){
            return this.show.filter((n) => n.t_id == tid);
        },

        btn_logout: function(){
            return router.push(`/`);
        },

        expert: async function(id) {
            url ="http://127.0.0.1:5000/api/export".concat("/").concat(id).concat("/").concat(this.uname)
            const res = await fetch(url , {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
              }
            })
        
            if (res.ok) {
              const d = await res.blob()  
              var a = document.createElement("a");
              a.href = window.URL.createObjectURL(d);
              a.download = `abhineetraman_details.csv`;
              a.click();
              //this.$router.push({ path: '/dashboard' })
              alert("Dasboard Exported")
            } else {
              const d = await res.json()
              this.$router.push({ path: '/login' })
              alert(d.message)
            }
        }
    },

    beforeMount: function() {
            fetch("http://localhost:5000/api/Theatre/GET", {
                method: "GET",
                mode: 'cors',
                headers: {
                    'Content-type' : 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                }
            })
            .then(response => response.json())
            .then(data => {
                this.$store.commit('theatre_state', data);
                this.venue = data;
            });
            fetch("http://localhost:5000/api/show/GET",{
                method: "GET",
                headers: {
                    'Content-type' : 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                }
            })
            .then(response => response.json())
            .then(data => {
                this.$store.commit('show_state', data);
                this.show = data;
            });

            val =  this.$store.state.theatre;
            if (val.length > 0)
                this.count = val.length;
            let c = this.$store.state.show;
            if (c.length > 0)
                this.scount = c.length;
            return val;
    },

    computed:{
       
    }
})

const signup = Vue.component("signup-form", {
    template: `
    <div style="background-color:#228855; color:#121212;">
        <div class="container" style=" height:100vh; width:400wh; display:flex ; background-color:#228855; align-items:center;justify-content:center;">
            <div class="row">
                <div class="col-sm-12 col-md-6">
                    <img src="static/login-img.jpg" style="object-fit:contain;" height="600px">
                </div>
                <div class="col-md-6" style="padding:15px; text-align: center; background-color:#EEEEEE; height:600px; display:flex ; align-items:center;justify-content:center; flex-direction:column; ">
                    <form>
                        &nbsp Email: &nbsp &nbsp <input type="email" v-model="email" required />
                        </p>
                        <p>
                        password: <input type="password" v-model="pwd" required />
                        </p>
                        <br>
                        <button v-on:click="post_User" class="btn btn-dark"> Register </button>
                        <br>
                        Already a User? <router-link to="/">Login</router-link>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function(){
        return{
            email: "",
            pwd: "",
        }
    },
    methods: {
        post_User: function(){
            if (this.uname === "" || this.pwd === "" || this.uname === null || this.pwd === null)
                return javascript.void(0);
            data = {
                "email": this.email,
                "pwd": this.pwd
            };
            url = "http://localhost:5000/api/signup/POST"
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
                alert("Account created");
                return router.push(`/`);
            });
        }
    },
    computed:{

    }
})

const login = Vue.component("login-form", {
    template: `
        <div style="background-color:#228855; color:#121212;">
            <div class="container" style=" height:100vh; width:400wh; display:flex ; background-color:#228855; align-items:center;justify-content:center;">
                <div class="row">
                    <div class="col-sm-12 col-md-6">
                        <img src="static/login-img.jpg" style="object-fit:contain;" height="600px">
                    </div>
                    <div class="col-md-6" style="padding:15px; text-align: center; background-color:#EEEEEE; height:600px; display:flex ; align-items:center;justify-content:center; flex-direction:column; ">
                        <form>
                            Email: &nbsp &nbsp &nbsp<input type="text" v-model="email" required/>
                            </p>
                            <p>
                            password: <input type="password" v-model="pwd" required/>
                            </p>
                            <br>
                            <button v-on:click="login_check" class="btn btn-primary"> Login </button>
                            <br>
                            Not a User? <router-link to="/Signup">Sign Up</router-link>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,
    data: function(){
        return{
            uname: "",
            email: "",
            pwd: "",
            role: ""
        }
    },
    methods: {
        login_check: function(){
            if (this.email === "" || this.pwd === "" || this.email === null || this.pwd === null)
                return javascript.void(0);
            url = "http://localhost:5000/api/login/".concat(this.email).concat("/").concat(this.pwd);
            fetch(url, {
                method : "POST",
                headers:{
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if(data.urole == "admin"){
                    this.uname = data.username;
                    this.$store.commit('change_uname', this.uname);
                    localStorage.setItem('accessToken', data.accessToken);
                    return router.push(`/root/${this.uname}`);
                }
                else if(data.urole == "user"){
                    this.uname = data.username;
                    this.$store.commit('change_uname', this.uname);
                    localStorage.setItem('accessToken', data.accessToken);
                    return router.push(`/home/${this.uname}`);
                }
                else
                    alert("Wrong Password");
            })
        }
    },
    computed: {
        
    }
})

const routes = [{
    path: '/',
    component: login
}, {
    path:'/Signup',
    component: signup
}, {
    path:'/root/:uname',
    component: dashboard
}, {
    path:'/home/:uname',
    component: home
}, {
    path: '/root/:uname/venue',
    component: add_venue
}, {
    path: '/root/:uname/venue/:id/show',
    component: add_show
}, {
    path: '/root/:uname/show/:id/edit',
    component: edit_show
}, {
    path: '/home/:uname/:sid/book',
    component: book_ticket
}, {
    path: '/home/:uname/bookings',
    component: bookings
}, {
    path: '/home/:uname/profile',
    component: profile
}, {
    path: '/root/:uname/summary',
    component: summary_graph
}, {
    path: '/home/search/:uname',
    component: search_home
}];

const router = new VueRouter({
    routes
})

var app = new Vue({
    el: '#app',
    router: router,
    store: store,
})