// node.js fetch API polyfill
const fetch = require("node-fetch");

// node.js DOM API polyfill
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// filesystem node.js module to write files
const fs = require("fs");

/**
 * Scrape the UMBC Degree Programs page and convert
 */
async function fetchPage() {
    // get the degree programs page HTML
    const response = await fetch("https://my3.my.umbc.edu/groups/studentorgs");
    const html = await response.text();

    // get the document from the JSDOM window object to make syntax consistent with browser
    const { document } = (new JSDOM(html)).window;

    const data = {
        studentOrganizations: []
    };

    // go through all the student org categories
    document.querySelectorAll(".group-section")
        .forEach(section => {
            // get the category name
            const title = section.querySelector(".section-title").textContent?.trim();
            console.log(title);

            // get all the groups from the category
            section.querySelectorAll(".group-box")
                .forEach(group => {
                    // get group avatar image url
                    const avatar = group.querySelector(".group-avatar > span");
                    const image = avatar.style.backgroundImage;
                    const url = image.replace("url(", "").replace(")", "");

                    // get student organization name
                    // that typo is present in myUMBC
                    const name = group.querySelector(".group-detais > .group-name").textContent?.trim();

                    // add a student organization entry to the list
                    data.studentOrganizations.push({
                        avatar: url,
                        category: title,
                        name: name
                    })
                });
        });

    // get today's date as a string to mark the data file for future reference
    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    // write the file to the disk into the data/ folder
    fs.writeFileSync(`data/${todayDateString}.json`, JSON.stringify(data));
}

fetchPage();